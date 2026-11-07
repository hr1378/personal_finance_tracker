package com.finance.account.dto;

import com.finance.account.model.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public class AccountRequest {

    private UUID userId;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String institution;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    private String currency;

    @NotNull(message = "Current balance is required")
    @DecimalMin(value = "-9999999999999999.99", message = "Balance is out of range")
    private BigDecimal currentBalance;

    private Boolean isActive;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
