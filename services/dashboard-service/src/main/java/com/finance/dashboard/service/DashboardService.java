package com.finance.dashboard.service;

import com.finance.dashboard.dto.DashboardSummary;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class DashboardService {

    private final WebClient transactionWebClient;
    private final WebClient budgetWebClient;
    private final WebClient debtWebClient;

    public DashboardService(
            WebClient transactionWebClient,
            WebClient budgetWebClient,
            WebClient debtWebClient) {
        this.transactionWebClient = transactionWebClient;
        this.budgetWebClient = budgetWebClient;
        this.debtWebClient = debtWebClient;
    }

    public Mono<DashboardSummary> getDashboardSummary(UUID userId) {
        return Mono.zip(
                fetchTransactionSummary(userId),
                fetchDebtSummary(userId),
                fetchBudgetSummary(userId)
        ).map(tuple -> {
            DashboardSummary summary = new DashboardSummary();
            summary.setTotalIncome(tuple.getT1().getTotalIncome());
            summary.setTotalExpenses(tuple.getT1().getTotalExpenses());
            summary.setNetCashFlow(tuple.getT1().getNetCashFlow());
            summary.setOutstandingDebt(tuple.getT2());
            summary.setBudgetUtilization(tuple.getT3());
            return summary;
        });
    }

    private Mono<TransactionSummary> fetchTransactionSummary(UUID userId) {
        return transactionWebClient.get()
                .uri("/api/transactions/summary")
                .retrieve()
                .bodyToMono(TransactionSummary.class);
    }

    private Mono<BigDecimal> fetchDebtSummary(UUID userId) {
        return debtWebClient.get()
                .uri("/api/debts/user/{userId}", userId)
                .retrieve()
                .bodyToFlux(Object.class)
                .collectList()
                .map(debts -> debts.stream()
                        .map(d -> BigDecimal.valueOf(0)) // Would parse actual debt balances
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    private Mono<BigDecimal> fetchBudgetSummary(UUID userId) {
        return budgetWebClient.get()
                .uri("/api/budgets/user/{userId}", userId)
                .retrieve()
                .bodyToFlux(Object.class)
                .collectList()
                .map(budgets -> BigDecimal.valueOf(0)); // Would calculate actual utilization
    }

    private static class TransactionSummary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpenses;
        private BigDecimal netCashFlow;

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
    }
}
