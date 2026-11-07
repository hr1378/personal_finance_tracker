package com.finance.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

/**
 * Fetches a compact finance snapshot from the downstream services on behalf of
 * the authenticated user. Only invoked when the user explicitly grants access.
 */
@Service
public class FinanceContextService {

    private static final Logger logger = LoggerFactory.getLogger(FinanceContextService.class);
    private static final Duration TIMEOUT = Duration.ofSeconds(15);

    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${services.transaction.url}")
    private String transactionUrl;
    @Value("${services.budget.url}")
    private String budgetUrl;
    @Value("${services.debt.url}")
    private String debtUrl;
    @Value("${services.dashboard.url}")
    private String dashboardUrl;
    @Value("${services.accounts.url}")
    private String accountsUrl;

    /** Returns a JSON string summarizing the user's finances, or null on failure. */
    public String getFinanceContext(UUID userId) {
        StringBuilder sb = new StringBuilder("{\"userFinance\":{");
        boolean first = true;

        first = append(sb, first, "dashboardSummary", getJson(dashboardUrl + "/api/dashboard/summary", userId));
        first = append(sb, first, "debts", compactList(getJson(debtUrl + "/api/debts/user/" + userId, userId),
                new String[]{"name", "originalBalance", "currentBalance", "apr", "minimumPayment", "dueDate"}));
        first = append(sb, first, "budgets", compactList(getJson(budgetUrl + "/api/budgets/user/" + userId, userId),
                new String[]{"category", "spendingLimit", "month", "year"}));
        first = append(sb, first, "accounts", compactList(getJson(accountsUrl + "/api/accounts/user/" + userId, userId),
                new String[]{"name", "institution", "accountType", "currentBalance", "isActive"}));
        first = append(sb, first, "cards", compactList(getJson(accountsUrl + "/api/cards/user/" + userId, userId),
                new String[]{"name", "cardType", "lastFour", "network", "currentBalance", "isActive"}));

        // Recent transactions: fetch all and keep the latest 25 to bound prompt size
        JsonNode txs = getJsonNode(transactionUrl + "/api/transactions", userId);
        if (txs != null && txs.isArray()) {
            StringBuilder recent = new StringBuilder("[");
            int count = 0;
            // transactions are returned unordered; take a bounded sample
            for (JsonNode tx : txs) {
                if (count >= 25) break;
                if (count > 0) recent.append(',');
                recent.append(compactFields(tx, new String[]{"type", "amount", "category", "date", "description", "accountId", "cardId"}));
                count++;
            }
            recent.append(']');
            appendRaw(sb, first, "recentTransactions", recent.toString());
        }

        sb.append("}}");
        return sb.toString();
    }

    private boolean append(StringBuilder sb, boolean first, String key, String json) {
        if (json == null) return first;
        if (!first) sb.append(',');
        sb.append('"').append(key).append("\":").append(json);
        return false;
    }

    private void appendRaw(StringBuilder sb, boolean first, String key, String json) {
        if (!first) sb.append(',');
        sb.append('"').append(key).append("\":").append(json);
    }

    private String getJson(String url, UUID userId) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(TIMEOUT)
                    .header("X-User-Id", userId.toString())
                    .GET()
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() >= 400) {
                logger.warn("Finance context fetch failed {} -> {}", url, resp.statusCode());
                return null;
            }
            return resp.body();
        } catch (Exception e) {
            logger.warn("Finance context fetch error for {}: {}", url, e.getMessage());
            return null;
        }
    }

    private JsonNode getJsonNode(String url, UUID userId) {
        String body = getJson(url, userId);
        if (body == null) return null;
        try {
            return objectMapper.readTree(body);
        } catch (Exception e) {
            return null;
        }
    }

    /** Keeps only the requested fields of each array element to shrink the payload. */
    private String compactList(String jsonArray, String[] fields) {
        if (jsonArray == null) return null;
        try {
            JsonNode node = objectMapper.readTree(jsonArray);
            if (!node.isArray()) return jsonArray;
            StringBuilder sb = new StringBuilder("[");
            int i = 0;
            for (JsonNode item : node) {
                if (i++ > 0) sb.append(',');
                sb.append(compactFields(item, fields));
            }
            return sb.append(']').toString();
        } catch (Exception e) {
            return jsonArray;
        }
    }

    private String compactFields(JsonNode node, String[] fields) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (String f : fields) {
            JsonNode v = node.get(f);
            if (v == null || v.isNull()) continue;
            if (!first) sb.append(',');
            first = false;
            sb.append('"').append(f).append("\":").append(v.isTextual() ? '"' + v.asText() + '"' : v.toString());
        }
        return sb.append('}').toString();
    }
}
