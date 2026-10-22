package com.finance.auth.dto;

public class RegisterRequest {
    private String email;
    private String password;
    private String preferredCurrency;

    public RegisterRequest() {
    }

    public RegisterRequest(String email, String password, String preferredCurrency) {
        this.email = email;
        this.password = password;
        this.preferredCurrency = preferredCurrency;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(String preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }
}
