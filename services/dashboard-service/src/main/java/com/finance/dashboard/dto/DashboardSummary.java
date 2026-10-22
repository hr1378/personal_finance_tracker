package com.finance.dashboard.dto;

import java.math.BigDecimal;

public class DashboardSummary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netCashFlow;
    private BigDecimal outstandingDebt;
    private BigDecimal budgetUtilization;

    public DashboardSummary() {
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetCashFlow() {
        return netCashFlow;
    }

    public void setNetCashFlow(BigDecimal netCashFlow) {
        this.netCashFlow = netCashFlow;
    }

    public BigDecimal getOutstandingDebt() {
        return outstandingDebt;
    }

    public void setOutstandingDebt(BigDecimal outstandingDebt) {
        this.outstandingDebt = outstandingDebt;
    }

    public BigDecimal getBudgetUtilization() {
        return budgetUtilization;
    }

    public void setBudgetUtilization(BigDecimal budgetUtilization) {
        this.budgetUtilization = budgetUtilization;
    }
}
