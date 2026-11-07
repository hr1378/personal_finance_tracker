package com.finance.chatbot.controller;

import com.finance.chatbot.dto.ChatRequest;
import com.finance.chatbot.dto.ChatResponse;
import com.finance.chatbot.filter.UserContextFilter;
import com.finance.chatbot.service.FinanceContextService;
import com.finance.chatbot.service.LlmClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private static final String BASE_SYSTEM_PROMPT =
            "You are a helpful personal finance assistant inside a finance tracking app. " +
            "Answer concisely and practically. If the user shares finance data, " +
            "use it to answer their questions but never invent numbers.";

    private final LlmClient llmClient;
    private final FinanceContextService financeContextService;

    public ChatController(LlmClient llmClient, FinanceContextService financeContextService) {
        this.llmClient = llmClient;
        this.financeContextService = financeContextService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        UUID userId = UserContextFilter.currentUserId.get();
        String systemPrompt = BASE_SYSTEM_PROMPT;

        if (request.isIncludeFinanceData() && userId != null) {
            String context = financeContextService.getFinanceContext(userId);
            systemPrompt += "\n\nThe user's current finance data (JSON) is provided below. " +
                    "The user explicitly granted permission to view it for this conversation.\n" + context;
        } else {
            systemPrompt += "\n\nThe user has NOT shared their finance data. Do not assume access to it; " +
                    "if they ask about their finances, suggest enabling data sharing.";
        }

        return ResponseEntity.ok(llmClient.chat(request, systemPrompt));
    }

    @GetMapping("/status")
    public ResponseEntity<java.util.Map<String, String>> status() {
        // Exposes only which provider is configured (never the key itself)
        return ResponseEntity.ok(java.util.Map.of("provider", llmClient.detectProvider() == null ? "none" : llmClient.detectProvider()));
    }
}
