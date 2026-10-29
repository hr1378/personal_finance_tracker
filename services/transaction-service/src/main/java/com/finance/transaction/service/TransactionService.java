package com.finance.transaction.service;

import com.finance.transaction.dto.TransactionRequest;
import com.finance.transaction.dto.TransactionSummary;
import com.finance.transaction.filter.UserContextFilter;
import com.finance.transaction.model.Transaction;
import com.finance.transaction.model.TransactionType;
import com.finance.transaction.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    private UUID getCurrentUserId() {
        UUID userId = UserContextFilter.currentUserId.get();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        return userId;
    }

    private void verifyOwnership(UUID transactionId, UUID userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        if (!transaction.getUserId().equals(userId)) {
            throw new SecurityException("Access denied: Transaction does not belong to user");
        }
    }

    public Transaction createTransaction(TransactionRequest request) {
        UUID currentUserId = getCurrentUserId();

        // Override the user ID from request with authenticated user ID
        Transaction transaction = new Transaction(
                currentUserId,
                request.getType(),
                request.getAmount(),
                request.getCategory(),
                request.getDate(),
                request.getDescription()
        );
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        UUID currentUserId = getCurrentUserId();
        return transactionRepository.findByUserId(currentUserId);
    }

    public List<Transaction> getTransactionsByUser(UUID userId) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own transactions
        if (!userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's transactions");
        }

        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionsByType(TransactionType type) {
        UUID currentUserId = getCurrentUserId();
        return transactionRepository.findByUserIdAndType(currentUserId, type);
    }

    public Transaction getTransactionById(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
    }

    public void deleteTransaction(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        if (!transactionRepository.existsById(id)) {
            throw new RuntimeException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }

    public TransactionSummary getSummary(UUID userId) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own summary
        if (userId != null && !userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's summary");
        }

        List<Transaction> transactions = transactionRepository.findByUserId(currentUserId);
        BigDecimal totalIncome = transactions.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new TransactionSummary(totalIncome, totalExpenses);
    }
}
