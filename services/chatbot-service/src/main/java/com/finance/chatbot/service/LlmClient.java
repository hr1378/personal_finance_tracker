package com.finance.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.finance.chatbot.dto.ChatRequest;
import com.finance.chatbot.dto.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class LlmClient {

    private static final Logger logger = LoggerFactory.getLogger(LlmClient.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(60);

    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${chatbot.openai.api-key:}")
    private String openAiApiKey;
    @Value("${chatbot.openai.base-url:https://api.openai.com}")
    private String openAiBaseUrl;
    @Value("${chatbot.openai.model:gpt-4o-mini}")
    private String openAiModel;
    @Value("${chatbot.anthropic.api-key:}")
    private String anthropicApiKey;
    @Value("${chatbot.anthropic.model:claude-3-5-haiku-20241022}")
    private String anthropicModel;
    @Value("${chatbot.gemini.api-key:}")
    private String geminiApiKey;
    @Value("${chatbot.gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    public ChatResponse chat(ChatRequest request, String systemPrompt) {
        String provider = detectProvider();
        if (provider == null) {
            return new ChatResponse(
                    "No AI provider is configured. Set one of OPENAI_API_KEY, ANTHROPIC_API_KEY, " +
                            "or GEMINI_API_KEY in the environment and restart the chatbot service.",
                    "none");
        }

        List<ChatRequest.ChatMessage> messages = buildMessages(request, systemPrompt);
        try {
            return switch (provider) {
                case "openai" -> callOpenAi(messages);
                case "anthropic" -> callAnthropic(messages);
                case "gemini" -> callGemini(messages);
                default -> throw new IllegalStateException("Unknown provider: " + provider);
            };
        } catch (Exception e) {
            logger.error("LLM call failed for provider {}", provider, e);
            return new ChatResponse("Sorry, the AI provider request failed: " + e.getMessage(), provider);
        }
    }

    public String detectProvider() {
        if (hasKey(openAiApiKey)) return "openai";
        if (hasKey(anthropicApiKey)) return "anthropic";
        if (hasKey(geminiApiKey)) return "gemini";
        return null;
    }

    private boolean hasKey(String key) {
        return key != null && !key.isBlank();
    }

    private List<ChatRequest.ChatMessage> buildMessages(ChatRequest request, String systemPrompt) {
        java.util.List<ChatRequest.ChatMessage> messages = new java.util.ArrayList<>();
        messages.add(new ChatRequest.ChatMessage("system", systemPrompt));
        if (request.getHistory() != null) {
            request.getHistory().stream()
                    .filter(m -> m.getRole() != null && m.getContent() != null
                            && ("user".equals(m.getRole()) || "assistant".equals(m.getRole())))
                    .forEach(messages::add);
        }
        messages.add(new ChatRequest.ChatMessage("user", request.getMessage()));
        return messages;
    }

    private ChatResponse callOpenAi(List<ChatRequest.ChatMessage> messages) throws Exception {
        ArrayNode msgs = objectMapper.createArrayNode();
        for (ChatRequest.ChatMessage m : messages) {
            ObjectNode msg = objectMapper.createObjectNode();
            msg.put("role", "system".equals(m.getRole()) ? "system" : m.getRole());
            msg.put("content", m.getContent());
            msgs.add(msg);
        }
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", openAiModel);
        body.set("messages", msgs);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(openAiBaseUrl.replaceAll("/$", "") + "/v1/chat/completions"))
                .timeout(TIMEOUT)
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        JsonNode resp = send(req);
        String reply = resp.path("choices").path(0).path("message").path("content").asText("(empty response)");
        return new ChatResponse(reply, "openai");
    }

    private ChatResponse callAnthropic(List<ChatRequest.ChatMessage> messages) throws Exception {
        // Anthropic has no system role in messages; extract it
        String system = messages.stream()
                .filter(m -> "system".equals(m.getRole()))
                .map(ChatRequest.ChatMessage::getContent)
                .findFirst().orElse("");
        ArrayNode msgs = objectMapper.createArrayNode();
        for (ChatRequest.ChatMessage m : messages) {
            if ("system".equals(m.getRole())) continue;
            ObjectNode msg = objectMapper.createObjectNode();
            msg.put("role", m.getRole());
            msg.put("content", m.getContent());
            msgs.add(msg);
        }
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", anthropicModel);
        body.put("max_tokens", 1024);
        body.put("system", system);
        body.set("messages", msgs);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .timeout(TIMEOUT)
                .header("Content-Type", "application/json")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        JsonNode resp = send(req);
        String reply = resp.path("content").path(0).path("text").asText("(empty response)");
        return new ChatResponse(reply, "anthropic");
    }

    private ChatResponse callGemini(List<ChatRequest.ChatMessage> messages) throws Exception {
        StringBuilder prompt = new StringBuilder();
        for (ChatRequest.ChatMessage m : messages) {
            prompt.append(m.getRole().toUpperCase()).append(": ").append(m.getContent()).append("\n\n");
        }
        ObjectNode body = objectMapper.createObjectNode();
        ArrayNode contents = body.putArray("contents");
        ObjectNode content = objectMapper.createObjectNode();
        ArrayNode parts = content.putArray("parts");
        parts.addObject().put("text", prompt.toString());
        contents.add(content);
        body.put("systemInstruction", ""); // keep simple: system prompt is inlined above

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent?key=" + geminiApiKey;
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(TIMEOUT)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        JsonNode resp = send(req);
        String reply = resp.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("(empty response)");
        return new ChatResponse(reply, "gemini");
    }

    private JsonNode send(HttpRequest req) throws Exception {
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() >= 400) {
            throw new RuntimeException("Provider returned HTTP " + resp.statusCode() + ": "
                    + resp.body().substring(0, Math.min(300, resp.body().length())));
        }
        return objectMapper.readTree(resp.body());
    }
}
