package com.finance.budget.service;

import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.model.Budget;
import com.finance.budget.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Budget createBudget(BudgetRequest request) {
        Budget budget = new Budget();
        budget.setUserId(request.getUserId());
        budget.setCategory(request.getCategory());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setSpendingLimit(request.getSpendingLimit());
        return budgetRepository.save(budget);
    }

    public List<Budget> getBudgetsByUser(UUID userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getBudgetsByUserAndMonth(UUID userId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    public Budget getBudgetById(UUID id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
    }

    public Budget updateBudget(UUID id, BudgetRequest request) {
        Budget budget = getBudgetById(id);
        budget.setCategory(request.getCategory());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setSpendingLimit(request.getSpendingLimit());
        budget.setUpdatedAt(LocalDateTime.now());
        return budgetRepository.save(budget);
    }

    public void deleteBudget(UUID id) {
        if (!budgetRepository.existsById(id)) {
            throw new RuntimeException("Budget not found");
        }
        budgetRepository.deleteById(id);
    }

    public BigDecimal calculateSpent(UUID userId, String category, Integer month, Integer year) {
        // This would call Transaction Service in a real implementation
        // For now, return 0
        return BigDecimal.ZERO;
    }

    public BigDecimal calculateRemaining(UUID budgetId) {
        Budget budget = getBudgetById(budgetId);
        BigDecimal spent = calculateSpent(budget.getUserId(), budget.getCategory(), budget.getMonth(), budget.getYear());
        return budget.getSpendingLimit().subtract(spent);
    }
}
