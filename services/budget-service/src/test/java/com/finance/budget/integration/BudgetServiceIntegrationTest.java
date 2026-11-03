package com.finance.budget.integration;

import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.model.Budget;
import com.finance.budget.repository.BudgetRepository;
import com.finance.budget.service.BudgetService;
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
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Testcontainers
@AutoConfigureWebMvc
class BudgetServiceIntegrationTest {

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
    private BudgetService budgetService;

    @Autowired
    private BudgetRepository budgetRepository;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        budgetRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        budgetRepository.deleteAll();
    }

    @Test
    void createAndRetrieveBudget_ShouldWork() {
        com.finance.budget.filter.UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request = new BudgetRequest();
        request.setUserId(testUserId);
        request.setCategory("Groceries");
        request.setMonth(1);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("500.00"));

        Budget created = budgetService.createBudget(request);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(testUserId, created.getUserId());
        assertEquals("Groceries", created.getCategory());
        assertEquals(1, created.getMonth());
        assertEquals(2024, created.getYear());
        assertEquals(new BigDecimal("500.00"), created.getSpendingLimit());

        Budget retrieved = budgetService.getBudgetById(created.getId());
        assertEquals(created.getId(), retrieved.getId());
        assertEquals(created.getCategory(), retrieved.getCategory());
    }

    @Test
    void getBudgetsByUser_ShouldReturnOnlyUserBudgets() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();

        com.finance.budget.filter.UserContextFilter.currentUserId.set(user1);
        BudgetRequest request1 = new BudgetRequest();
        request1.setUserId(user1);
        request1.setCategory("Groceries");
        request1.setMonth(1);
        request1.setYear(2024);
        request1.setSpendingLimit(new BigDecimal("500.00"));
        budgetService.createBudget(request1);

        com.finance.budget.filter.UserContextFilter.currentUserId.set(user2);
        BudgetRequest request2 = new BudgetRequest();
        request2.setUserId(user2);
        request2.setCategory("Entertainment");
        request2.setMonth(1);
        request2.setYear(2024);
        request2.setSpendingLimit(new BigDecimal("300.00"));
        budgetService.createBudget(request2);

        com.finance.budget.filter.UserContextFilter.currentUserId.set(user1);
        List<Budget> user1Budgets = budgetService.getBudgetsByUser(user1);

        assertEquals(1, user1Budgets.size());
        assertEquals(user1, user1Budgets.get(0).getUserId());
        assertEquals("Groceries", user1Budgets.get(0).getCategory());
    }

    @Test
    void updateBudget_ShouldModifyExistingBudget() {
        com.finance.budget.filter.UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request = new BudgetRequest();
        request.setUserId(testUserId);
        request.setCategory("Groceries");
        request.setMonth(1);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("500.00"));

        Budget created = budgetService.createBudget(request);

        BudgetRequest updateRequest = new BudgetRequest();
        updateRequest.setSpendingLimit(new BigDecimal("600.00"));

        Budget updated = budgetService.updateBudget(created.getId(), updateRequest);

        assertEquals(new BigDecimal("600.00"), updated.getSpendingLimit());
    }

    @Test
    void deleteBudget_ShouldRemoveFromDatabase() {
        com.finance.budget.filter.UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request = new BudgetRequest();
        request.setUserId(testUserId);
        request.setCategory("Groceries");
        request.setMonth(1);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("500.00"));

        Budget created = budgetService.createBudget(request);

        budgetService.deleteBudget(created.getId());

        assertFalse(budgetRepository.existsById(created.getId()));
    }

    @Test
    void getBudgetsByUserAndMonth_ShouldReturnCorrectBudgets() {
        com.finance.budget.filter.UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request1 = new BudgetRequest();
        request1.setUserId(testUserId);
        request1.setCategory("Groceries");
        request1.setMonth(1);
        request1.setYear(2024);
        request1.setSpendingLimit(new BigDecimal("500.00"));
        budgetService.createBudget(request1);

        BudgetRequest request2 = new BudgetRequest();
        request2.setUserId(testUserId);
        request2.setCategory("Entertainment");
        request2.setMonth(2);
        request2.setYear(2024);
        request2.setSpendingLimit(new BigDecimal("300.00"));
        budgetService.createBudget(request2);

        List<Budget> januaryBudgets = budgetService.getBudgetsByUserAndMonth(testUserId, 1, 2024);

        assertEquals(1, januaryBudgets.size());
        assertEquals(1, januaryBudgets.get(0).getMonth());
    }
}
