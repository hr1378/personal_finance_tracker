package com.finance.debt.controller;

import com.finance.debt.dto.DebtPaymentRequest;
import com.finance.debt.dto.DebtRequest;
import com.finance.debt.model.Debt;
import com.finance.debt.model.DebtPayment;
import com.finance.debt.service.DebtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/debts")
public class DebtController {

    private final DebtService debtService;

    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    @PostMapping
    public ResponseEntity<Debt> createDebt(@Valid @RequestBody DebtRequest request) {
        Debt debt = debtService.createDebt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(debt);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Debt>> getDebtsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(debtService.getDebtsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Debt> getDebtById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(debtService.getDebtById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Debt> updateDebt(@PathVariable UUID id, @Valid @RequestBody DebtRequest request) {
        try {
            return ResponseEntity.ok(debtService.updateDebt(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable UUID id) {
        try {
            debtService.deleteDebt(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{debtId}/payments")
    public ResponseEntity<DebtPayment> createPayment(@PathVariable UUID debtId, @Valid @RequestBody DebtPaymentRequest request) {
        request.setDebtId(debtId);
        DebtPayment payment = debtService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/{debtId}/payments")
    public ResponseEntity<List<DebtPayment>> getPaymentsByDebt(@PathVariable UUID debtId) {
        return ResponseEntity.ok(debtService.getPaymentsByDebt(debtId));
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<BigDecimal> getProgress(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(debtService.calculateProgress(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
