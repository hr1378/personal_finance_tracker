package com.finance.debt.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class DebtPaymentEvent {
    private UUID id;
    private UUID userId;
    private UUID debtId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String note;
    private String eventType; // CREATED
    private long timestamp;

    public DebtPaymentEvent() {
    }

    public DebtPaymentEvent(UUID id, UUID userId, UUID debtId, BigDecimal amount,
                           LocalDate paymentDate, String note, String eventType) {
        this.id = id;
        this.userId = userId;
        this.debtId = debtId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.note = note;
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

    public UUID getDebtId() {
        return debtId;
    }

    public void setDebtId(UUID debtId) {
        this.debtId = debtId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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
