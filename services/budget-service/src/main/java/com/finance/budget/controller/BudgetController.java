package com.finance.budget.controller;

import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.model.Budget;
import com.finance.budget.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody BudgetRequest request) {
        Budget budget = budgetService.createBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(budgetService.getBudgetsByUser(userId));
    }

    @GetMapping("/user/{userId}/month/{month}/year/{year}")
    public ResponseEntity<List<Budget>> getBudgetsByMonth(
            @PathVariable UUID userId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return ResponseEntity.ok(budgetService.getBudgetsByUserAndMonth(userId, month, year));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(budgetService.getBudgetById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(@PathVariable UUID id, @Valid @RequestBody BudgetRequest request) {
        try {
            return ResponseEntity.ok(budgetService.updateBudget(id, request));
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
