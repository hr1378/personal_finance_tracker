package com.finance.debt.integration;

import com.finance.debt.dto.DebtPaymentRequest;
import com.finance.debt.dto.DebtRequest;
import com.finance.debt.model.Debt;
import com.finance.debt.model.DebtPayment;
import com.finance.debt.repository.DebtPaymentRepository;
import com.finance.debt.repository.DebtRepository;
import com.finance.debt.service.DebtService;
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
class DebtServiceIntegrationTest {

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
    private DebtService debtService;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private DebtPaymentRepository debtPaymentRepository;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        debtRepository.deleteAll();
        debtPaymentRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        debtPaymentRepository.deleteAll();
        debtRepository.deleteAll();
    }

    @Test
    void createAndRetrieveDebt_ShouldWork() {
        com.finance.debt.filter.UserContextFilter.currentUserId.set(testUserId);

        DebtRequest request = new DebtRequest();
        request.setUserId(testUserId);
        request.setName("Credit Card");
        request.setOriginalBalance(new BigDecimal("5000.00"));
        request.setCurrentBalance(new BigDecimal("3000.00"));
        request.setApr(new BigDecimal("18.99"));
        request.setMinimumPayment(new BigDecimal("150.00"));
        request.setDueDate(LocalDate.of(2024, 12, 15));

        Debt created = debtService.createDebt(request);

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(testUserId, created.getUserId());
        assertEquals("Credit Card", created.getName());
        assertEquals(new BigDecimal("5000.00"), created.getOriginalBalance());
        assertEquals(new BigDecimal("3000.00"), created.getCurrentBalance());

        Debt retrieved = debtService.getDebtById(created.getId());
        assertEquals(created.getId(), retrieved.getId());
        assertEquals(created.getName(), retrieved.getName());
    }

    @Test
    void getDebtsByUser_ShouldReturnOnlyUserDebts() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();

        com.finance.debt.filter.UserContextFilter.currentUserId.set(user1);
        DebtRequest request1 = new DebtRequest();
        request1.setUserId(user1);
        request1.setName("Credit Card");
        request1.setOriginalBalance(new BigDecimal("5000.00"));
        request1.setCurrentBalance(new BigDecimal("3000.00"));
        request1.setApr(new BigDecimal("18.99"));
        request1.setMinimumPayment(new BigDecimal("150.00"));
        request1.setDueDate(LocalDate.of(2024, 12, 15));
        debtService.createDebt(request1);

        com.finance.debt.filter.UserContextFilter.currentUserId.set(user2);
        DebtRequest request2 = new DebtRequest();
        request2.setUserId(user2);
        request2.setName("Student Loan");
        request2.setOriginalBalance(new BigDecimal("20000.00"));
        request2.setCurrentBalance(new BigDecimal("15000.00"));
        request2.setApr(new BigDecimal("5.50"));
        request2.setMinimumPayment(new BigDecimal("200.00"));
        request2.setDueDate(LocalDate.of(2024, 12, 20));
        debtService.createDebt(request2);

        com.finance.debt.filter.UserContextFilter.currentUserId.set(user1);
        List<Debt> user1Debts = debtService.getDebtsByUser(user1);

        assertEquals(1, user1Debts.size());
        assertEquals(user1, user1Debts.get(0).getUserId());
        assertEquals("Credit Card", user1Debts.get(0).getName());
    }

    @Test
    void createPayment_ShouldRecordPayment() {
        com.finance.debt.filter.UserContextFilter.currentUserId.set(testUserId);

        DebtRequest debtRequest = new DebtRequest();
        debtRequest.setUserId(testUserId);
        debtRequest.setName("Credit Card");
        debtRequest.setOriginalBalance(new BigDecimal("5000.00"));
        debtRequest.setCurrentBalance(new BigDecimal("3000.00"));
        debtRequest.setApr(new BigDecimal("18.99"));
        debtRequest.setMinimumPayment(new BigDecimal("150.00"));
        debtRequest.setDueDate(LocalDate.of(2024, 12, 15));
        Debt debt = debtService.createDebt(debtRequest);

        DebtPaymentRequest paymentRequest = new DebtPaymentRequest();
        paymentRequest.setUserId(testUserId);
        paymentRequest.setDebtId(debt.getId());
        paymentRequest.setAmount(new BigDecimal("500.00"));
        paymentRequest.setPaymentDate(LocalDate.now());
        paymentRequest.setNote("Monthly payment");

        DebtPayment payment = debtService.createPayment(paymentRequest);

        assertNotNull(payment);
        assertNotNull(payment.getId());
        assertEquals(debt.getId(), payment.getDebtId());
        assertEquals(new BigDecimal("500.00"), payment.getAmount());
    }

    @Test
    void getPaymentsByDebt_ShouldReturnDebtPayments() {
        com.finance.debt.filter.UserContextFilter.currentUserId.set(testUserId);

        DebtRequest debtRequest = new DebtRequest();
        debtRequest.setUserId(testUserId);
        debtRequest.setName("Credit Card");
        debtRequest.setOriginalBalance(new BigDecimal("5000.00"));
        debtRequest.setCurrentBalance(new BigDecimal("3000.00"));
        debtRequest.setApr(new BigDecimal("18.99"));
        debtRequest.setMinimumPayment(new BigDecimal("150.00"));
        debtRequest.setDueDate(LocalDate.of(2024, 12, 15));
        Debt debt = debtService.createDebt(debtRequest);

        DebtPaymentRequest paymentRequest = new DebtPaymentRequest();
        paymentRequest.setUserId(testUserId);
        paymentRequest.setDebtId(debt.getId());
        paymentRequest.setAmount(new BigDecimal("500.00"));
        paymentRequest.setPaymentDate(LocalDate.now());
        paymentRequest.setNote("Monthly payment");
        debtService.createPayment(paymentRequest);

        List<DebtPayment> payments = debtService.getPaymentsByDebt(debt.getId());

        assertEquals(1, payments.size());
        assertEquals(debt.getId(), payments.get(0).getDebtId());
    }

    @Test
    void calculateProgress_ShouldReturnCorrectPercentage() {
        com.finance.debt.filter.UserContextFilter.currentUserId.set(testUserId);

        DebtRequest request = new DebtRequest();
        request.setUserId(testUserId);
        request.setName("Credit Card");
        request.setOriginalBalance(new BigDecimal("5000.00"));
        request.setCurrentBalance(new BigDecimal("3000.00"));
        request.setApr(new BigDecimal("18.99"));
        request.setMinimumPayment(new BigDecimal("150.00"));
        request.setDueDate(LocalDate.of(2024, 12, 15));
        Debt debt = debtService.createDebt(request);

        BigDecimal progress = debtService.calculateProgress(debt.getId());

        // Progress = (5000 - 3000) / 5000 * 100 = 40%
        assertEquals(new BigDecimal("40.00"), progress);
    }

    @Test
    void deleteDebt_ShouldRemoveFromDatabase() {
        com.finance.debt.filter.UserContextFilter.currentUserId.set(testUserId);

        DebtRequest request = new DebtRequest();
        request.setUserId(testUserId);
        request.setName("Credit Card");
        request.setOriginalBalance(new BigDecimal("5000.00"));
        request.setCurrentBalance(new BigDecimal("3000.00"));
        request.setApr(new BigDecimal("18.99"));
        request.setMinimumPayment(new BigDecimal("150.00"));
        request.setDueDate(LocalDate.of(2024, 12, 15));
        Debt debt = debtService.createDebt(request);

        debtService.deleteDebt(debt.getId());

        assertFalse(debtRepository.existsById(debt.getId()));
    }
}
