package com.finance.budget.controller;

import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.dto.BudgetResponse;
import com.finance.budget.model.Budget;
import com.finance.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    private BudgetResponse toResponse(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setUserId(budget.getUserId());
        response.setCategory(budget.getCategory());
        response.setMonth(budget.getMonth());
        response.setYear(budget.getYear());
        response.setSpendingLimit(budget.getSpendingLimit());
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());

        BigDecimal spent = budgetService.calculateSpent(
                budget.getUserId(),
                budget.getCategory(),
                budget.getMonth(),
                budget.getYear()
        );
        response.setSpent(spent);
        response.setRemaining(budget.getSpendingLimit().subtract(spent));

        return response;
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody BudgetRequest request) {
        Budget budget = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByUser(@PathVariable UUID userId) {
        List<Budget> budgets = budgetService.getBudgetsByUser(userId);
        return ResponseEntity.ok(budgets.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}/month/{month}/year/{year}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByMonth(
            @PathVariable UUID userId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        List<Budget> budgets = budgetService.getBudgetsByUserAndMonth(userId, month, year);
        return ResponseEntity.ok(budgets.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(toResponse(budgetService.getBudgetById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable UUID id, @Valid @RequestBody BudgetRequest request) {
        try {
            return ResponseEntity.ok(toResponse(budgetService.updateBudget(id, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID id) {
        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
