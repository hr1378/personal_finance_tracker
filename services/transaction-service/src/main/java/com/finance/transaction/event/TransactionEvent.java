package com.finance.transaction.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class TransactionEvent {
    private UUID id;
    private UUID userId;
    private String type;
    private BigDecimal amount;
    private String category;
    private LocalDate date;
    private String description;
    private UUID accountId;
    private UUID cardId;
    private String eventType; // CREATED, UPDATED, DELETED
    private long timestamp;

    public TransactionEvent() {
    }

    public TransactionEvent(UUID id, UUID userId, String type, BigDecimal amount, String category,
                           LocalDate date, String description, UUID accountId, UUID cardId, String eventType) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.date = date;
        this.description = description;
        this.accountId = accountId;
        this.cardId = cardId;
        this.eventType = eventType;
        this.timestamp = System.currentTimeMillis();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    public UUID getCardId() {
        return cardId;
    }

    public void setCardId(UUID cardId) {
        this.cardId = cardId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
