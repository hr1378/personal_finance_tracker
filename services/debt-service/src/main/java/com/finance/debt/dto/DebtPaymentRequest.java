package com.finance.debt.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class DebtPaymentRequest {
    private UUID userId;
    private UUID debtId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String note;

    public DebtPaymentRequest() {
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
}
