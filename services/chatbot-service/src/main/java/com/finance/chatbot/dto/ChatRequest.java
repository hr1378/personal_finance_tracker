package com.finance.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class ChatRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 4000, message = "Message too long")
    private String message;

    private boolean includeFinanceData = false;

    @Size(max = 20, message = "Too much history")
    private List<ChatMessage> history;

    public ChatRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isIncludeFinanceData() {
        return includeFinanceData;
    }

    public void setIncludeFinanceData(boolean includeFinanceData) {
        this.includeFinanceData = includeFinanceData;
    }

    public List<ChatMessage> getHistory() {
        return history;
    }

    public void setHistory(List<ChatMessage> history) {
        this.history = history;
    }

    public static class ChatMessage {
        private String role;
        private String content;

        public ChatMessage() {
        }

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
