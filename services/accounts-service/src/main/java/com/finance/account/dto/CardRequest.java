package com.finance.account.dto;

import com.finance.account.model.CardNetwork;
import com.finance.account.model.CardType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public class CardRequest {

    private UUID userId;

    private UUID accountId;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @NotNull(message = "Card type is required")
    private CardType cardType;

    @Size(min = 4, max = 4, message = "Last four must be exactly 4 digits")
    private String lastFour;

    private CardNetwork network;

    @DecimalMin(value = "0.00", message = "Credit limit cannot be negative")
    private BigDecimal creditLimit;

    @NotNull(message = "Current balance is required")
    @DecimalMin(value = "-9999999999999999.99", message = "Balance is out of range")
    private BigDecimal currentBalance;

    @DecimalMin(value = "0.00", message = "APR cannot be negative")
    private BigDecimal apr;

    @Min(value = 1, message = "Expiry month must be between 1 and 12")
    @Max(value = 12, message = "Expiry month must be between 1 and 12")
    private Integer expiryMonth;

    private Integer expiryYear;

    private Boolean isActive;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CardType getCardType() {
        return cardType;
    }

    public void setCardType(CardType cardType) {
        this.cardType = cardType;
    }

    public String getLastFour() {
        return lastFour;
    }

    public void setLastFour(String lastFour) {
        this.lastFour = lastFour;
    }

    public CardNetwork getNetwork() {
        return network;
    }

    public void setNetwork(CardNetwork network) {
        this.network = network;
    }

    public BigDecimal getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(BigDecimal creditLimit) {
        this.creditLimit = creditLimit;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public BigDecimal getApr() {
        return apr;
    }

    public void setApr(BigDecimal apr) {
        this.apr = apr;
    }

    public Integer getExpiryMonth() {
        return expiryMonth;
    }

    public void setExpiryMonth(Integer expiryMonth) {
        this.expiryMonth = expiryMonth;
    }

    public Integer getExpiryYear() {
        return expiryYear;
    }

    public void setExpiryYear(Integer expiryYear) {
        this.expiryYear = expiryYear;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
