package com.finance.transaction.integration;

import com.finance.transaction.dto.TransactionRequest;
import com.finance.transaction.model.Transaction;
import com.finance.transaction.model.TransactionType;
import com.finance.transaction.repository.TransactionRepository;
import com.finance.transaction.service.TransactionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Testcontainers
@AutoConfigureWebMvc
class TransactionServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepository transactionRepository;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        transactionRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        transactionRepository.deleteAll();
    }

    @Test
    void createAndRetrieveTransaction_ShouldWork() {
        // Set authenticated user context
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(testUserId);

        TransactionRequest request = new TransactionRequest();
        request.setUserId(testUserId);
        request.setType(TransactionType.INCOME);
        request.setAmount(new BigDecimal("1000.00"));
        request.setCategory("Salary");
        request.setDate(LocalDate.now());
        request.setDescription("Monthly salary");

        Transaction created = transactionService.createTransaction(request);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(testUserId, created.getUserId());
        assertEquals(TransactionType.INCOME, created.getType());
        assertEquals(new BigDecimal("1000.00"), created.getAmount());
        assertEquals("Salary", created.getCategory());

        // Retrieve the transaction
        Transaction retrieved = transactionService.getTransactionById(created.getId());
        assertEquals(created.getId(), retrieved.getId());
        assertEquals(created.getAmount(), retrieved.getAmount());
    }

    @Test
    void getTransactionsByUser_ShouldReturnOnlyUserTransactions() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();

        // Create transactions for user1
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(user1);
        TransactionRequest request1 = new TransactionRequest();
        request1.setUserId(user1);
        request1.setType(TransactionType.INCOME);
        request1.setAmount(new BigDecimal("1000.00"));
        request1.setCategory("Salary");
        request1.setDate(LocalDate.now());
        transactionService.createTransaction(request1);

        // Create transactions for user2
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(user2);
        TransactionRequest request2 = new TransactionRequest();
        request2.setUserId(user2);
        request2.setType(TransactionType.EXPENSE);
        request2.setAmount(new BigDecimal("500.00"));
        request2.setCategory("Groceries");
        request2.setDate(LocalDate.now());
        transactionService.createTransaction(request2);

        // Query as user1
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(user1);
        List<Transaction> user1Transactions = transactionService.getTransactionsByUser(user1);

        assertEquals(1, user1Transactions.size());
        assertEquals(user1, user1Transactions.get(0).getUserId());

        // Query as user2
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(user2);
        List<Transaction> user2Transactions = transactionService.getTransactionsByUser(user2);

        assertEquals(1, user2Transactions.size());
        assertEquals(user2, user2Transactions.get(0).getUserId());
    }

    @Test
    void deleteTransaction_ShouldRemoveFromDatabase() {
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(testUserId);

        TransactionRequest request = new TransactionRequest();
        request.setUserId(testUserId);
        request.setType(TransactionType.INCOME);
        request.setAmount(new BigDecimal("1000.00"));
        request.setCategory("Salary");
        request.setDate(LocalDate.now());

        Transaction created = transactionService.createTransaction(request);

        transactionService.deleteTransaction(created.getId());

        assertFalse(transactionRepository.existsById(created.getId()));
    }

    @Test
    void calculateSummary_ShouldReturnCorrectTotals() {
        com.finance.transaction.filter.UserContextFilter.currentUserId.set(testUserId);

        // Create income transaction
        TransactionRequest incomeRequest = new TransactionRequest();
        incomeRequest.setUserId(testUserId);
        incomeRequest.setType(TransactionType.INCOME);
        incomeRequest.setAmount(new BigDecimal("1000.00"));
        incomeRequest.setCategory("Salary");
        incomeRequest.setDate(LocalDate.now());
        transactionService.createTransaction(incomeRequest);

        // Create expense transaction
        TransactionRequest expenseRequest = new TransactionRequest();
        expenseRequest.setUserId(testUserId);
        expenseRequest.setType(TransactionType.EXPENSE);
        expenseRequest.setAmount(new BigDecimal("300.00"));
        expenseRequest.setCategory("Groceries");
        expenseRequest.setDate(LocalDate.now());
        transactionService.createTransaction(expenseRequest);

        var summary = transactionService.getSummary(testUserId);

        assertEquals(new BigDecimal("1000.00"), summary.getTotalIncome());
        assertEquals(new BigDecimal("300.00"), summary.getTotalExpenses());
        assertEquals(new BigDecimal("700.00"), summary.getNetCashFlow());
    }
}
