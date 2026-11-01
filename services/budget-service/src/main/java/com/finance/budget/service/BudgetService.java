package com.finance.budget.service;

import com.finance.budget.client.TransactionClient;
import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.dto.TransactionSummaryResponse;
import com.finance.budget.filter.UserContextFilter;
import com.finance.budget.model.Budget;
import com.finance.budget.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionClient transactionClient;

    public BudgetService(BudgetRepository budgetRepository, TransactionClient transactionClient) {
        this.budgetRepository = budgetRepository;
        this.transactionClient = transactionClient;
    }

    private UUID getCurrentUserId() {
        UUID userId = UserContextFilter.currentUserId.get();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        return userId;
    }

    private void verifyOwnership(UUID budgetId, UUID userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + budgetId));

        if (!budget.getUserId().equals(userId)) {
            throw new SecurityException("Access denied: Budget does not belong to user");
        }
    }

    public Budget createBudget(BudgetRequest request) {
        UUID currentUserId = getCurrentUserId();

        // Override the user ID from request with authenticated user ID
        Budget budget = new Budget();
        budget.setUserId(currentUserId);
        budget.setCategory(request.getCategory());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setSpendingLimit(request.getSpendingLimit());
        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgetsByUser(UUID userId) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own budgets
        if (!userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's budgets");
        }

        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getBudgetsByUserAndMonth(UUID userId, Integer month, Integer year) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own budgets
        if (!userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's budgets");
        }

        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    public Budget getBudgetById(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    public Budget updateBudget(UUID id, BudgetRequest request) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        Budget budget = getBudgetById(id);
        budget.setCategory(request.getCategory());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setSpendingLimit(request.getSpendingLimit());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    public void deleteBudget(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        if (!budgetRepository.existsById(id)) {
            throw new RuntimeException("Budget not found");
        }
        budgetRepository.deleteById(id);
    }

    public BigDecimal calculateSpent(UUID userId, String category, Integer month, Integer year) {
        try {
            List<TransactionSummaryResponse> transactions = transactionClient.getAllTransactions(userId);

            YearMonth budgetMonth = YearMonth.of(year, month);
            LocalDate startDate = budgetMonth.atDay(1);
            LocalDate endDate = budgetMonth.atEndOfMonth();

            return transactions.stream()
                    .filter(t -> t.getType().equalsIgnoreCase("EXPENSE"))
                    .filter(t -> t.getCategory().equalsIgnoreCase(category))
                    .filter(t -> {
                        LocalDate transactionDate = LocalDate.parse(t.getDate());
                        return !transactionDate.isBefore(startDate) && !transactionDate.isAfter(endDate);
                    })
                    .map(TransactionSummaryResponse::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            // Log error and return 0 if transaction service is unavailable
            System.err.println("Error fetching transactions: " + e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    public BigDecimal calculateRemaining(UUID budgetId) {
        Budget budget = getBudgetById(budgetId);
        BigDecimal spent = calculateSpent(budget.getUserId(), budget.getCategory(), budget.getMonth(), budget.getYear());
        return budget.getSpendingLimit().subtract(spent);
    }
}
