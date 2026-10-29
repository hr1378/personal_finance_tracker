package com.finance.transaction.service;

import com.finance.transaction.dto.TransactionRequest;
import com.finance.transaction.dto.TransactionSummary;
import com.finance.transaction.filter.UserContextFilter;
import com.finance.transaction.model.Transaction;
import com.finance.transaction.model.TransactionType;
import com.finance.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private TransactionService transactionService;

    private UUID testUserId;
    private UUID otherUserId;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        testTransaction = new Transaction();
        testTransaction.setId(UUID.randomUUID());
        testTransaction.setUserId(testUserId);
        testTransaction.setType(TransactionType.INCOME);
        testTransaction.setAmount(new BigDecimal("100.00"));
        testTransaction.setCategory("Salary");
        testTransaction.setDate(LocalDate.now());
        testTransaction.setDescription("Monthly salary");
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    @Test
    void createTransaction_ShouldSetAuthenticatedUserId_WhenValidRequest() {
        UserContextFilter.currentUserId.set(testUserId);

        TransactionRequest request = new TransactionRequest();
        request.setUserId(otherUserId); // Try to set different user ID
        request.setType(TransactionType.INCOME);
        request.setAmount(new BigDecimal("100.00"));
        request.setCategory("Salary");
        request.setDate(LocalDate.now());
        request.setDescription("Monthly salary");

        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        Transaction result = transactionService.createTransaction(request);

        assertNotNull(result);
        // Verify that the authenticated user ID is used, not the one from request
        verify(transactionRepository).save(argThat(t -> t.getUserId().equals(testUserId)));
    }

    @Test
    void createTransaction_ShouldThrowSecurityException_WhenNotAuthenticated() {
        TransactionRequest request = new TransactionRequest();
        request.setUserId(testUserId);
        request.setType(TransactionType.INCOME);
        request.setAmount(new BigDecimal("100.00"));
        request.setCategory("Salary");
        request.setDate(LocalDate.now());

        assertThrows(SecurityException.class, () -> transactionService.createTransaction(request));
    }

    @Test
    void getTransactionsByUser_ShouldReturnOnlyUserTransactions_WhenUserIdMatches() {
        UserContextFilter.currentUserId.set(testUserId);

        List<Transaction> userTransactions = Arrays.asList(testTransaction);
        when(transactionRepository.findByUserId(testUserId)).thenReturn(userTransactions);

        List<Transaction> result = transactionService.getTransactionsByUser(testUserId);

        assertEquals(1, result.size());
        assertEquals(testTransaction, result.get(0));
    }

    @Test
    void getTransactionsByUser_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> transactionService.getTransactionsByUser(otherUserId));
    }

    @Test
    void getTransactionById_ShouldReturnTransaction_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(transactionRepository.findById(testTransaction.getId())).thenReturn(Optional.of(testTransaction));

        Transaction result = transactionService.getTransactionById(testTransaction.getId());

        assertNotNull(result);
        assertEquals(testTransaction, result);
    }

    @Test
    void getTransactionById_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Transaction otherTransaction = new Transaction();
        otherTransaction.setId(UUID.randomUUID());
        otherTransaction.setUserId(otherUserId);

        when(transactionRepository.findById(otherTransaction.getId())).thenReturn(Optional.of(otherTransaction));

        assertThrows(SecurityException.class, () -> transactionService.getTransactionById(otherTransaction.getId()));
    }

    @Test
    void deleteTransaction_ShouldDelete_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(transactionRepository.existsById(testTransaction.getId())).thenReturn(true);
        doNothing().when(transactionRepository).deleteById(testTransaction.getId());

        transactionService.deleteTransaction(testTransaction.getId());

        verify(transactionRepository).deleteById(testTransaction.getId());
    }

    @Test
    void deleteTransaction_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Transaction otherTransaction = new Transaction();
        otherTransaction.setId(UUID.randomUUID());
        otherTransaction.setUserId(otherUserId);

        when(transactionRepository.findById(otherTransaction.getId())).thenReturn(Optional.of(otherTransaction));

        assertThrows(SecurityException.class, () -> transactionService.deleteTransaction(otherTransaction.getId()));
    }

    @Test
    void getSummary_ShouldCalculateCorrectTotals_ForAuthenticatedUser() {
        UserContextFilter.currentUserId.set(testUserId);

        Transaction income = new Transaction();
        income.setUserId(testUserId);
        income.setType(TransactionType.INCOME);
        income.setAmount(new BigDecimal("1000.00"));

        Transaction expense = new Transaction();
        expense.setUserId(testUserId);
        expense.setType(TransactionType.EXPENSE);
        expense.setAmount(new BigDecimal("300.00"));

        List<Transaction> transactions = Arrays.asList(income, expense);
        when(transactionRepository.findByUserId(testUserId)).thenReturn(transactions);

        TransactionSummary summary = transactionService.getSummary(testUserId);

        assertEquals(new BigDecimal("1000.00"), summary.getTotalIncome());
        assertEquals(new BigDecimal("300.00"), summary.getTotalExpenses());
        assertEquals(new BigDecimal("700.00"), summary.getNetCashFlow());
    }

    @Test
    void getSummary_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> transactionService.getSummary(otherUserId));
    }
}
