package com.finance.transaction.controller;

import com.finance.transaction.dto.TransactionRequest;
import com.finance.transaction.dto.TransactionResponse;
import com.finance.transaction.dto.TransactionSummary;
import com.finance.transaction.model.Transaction;
import com.finance.transaction.model.TransactionType;
import com.finance.transaction.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getUserId(),
                transaction.getType().name(),
                transaction.getAmount(),
                transaction.getCategoryName(),
                transaction.getDate(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@RequestBody TransactionRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getType() == null || request.getCategory() == null || request.getDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        Transaction transaction = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(transaction));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) TransactionType type) {
        List<Transaction> transactions;
        if (userId == null) {
            if (type == null) {
                transactions = transactionService.getAllTransactions();
            } else {
                transactions = transactionService.getTransactionsByType(type);
            }
        } else {
            if (type == null) {
                transactions = transactionService.getTransactionsByUser(userId);
            } else {
                transactions = transactionService.getTransactionsByUser(userId).stream()
                        .filter(t -> t.getType() == type)
                        .collect(Collectors.toList());
            }
        }
        return ResponseEntity.ok(transactions.stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(toResponse(transactionService.getTransactionById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<TransactionSummary> getSummary(@RequestParam(required = false) UUID userId) {
        if (userId == null) {
            return ResponseEntity.ok(transactionService.getSummary(null));
        }
        return ResponseEntity.ok(transactionService.getSummary(userId));
    }
}
