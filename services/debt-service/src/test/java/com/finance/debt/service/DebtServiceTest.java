package com.finance.debt.service;

import com.finance.debt.dto.DebtPaymentRequest;
import com.finance.debt.dto.DebtRequest;
import com.finance.debt.filter.UserContextFilter;
import com.finance.debt.model.Debt;
import com.finance.debt.model.DebtPayment;
import com.finance.debt.repository.DebtPaymentRepository;
import com.finance.debt.repository.DebtRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebtServiceTest {

    @Mock
    private DebtRepository debtRepository;

    @Mock
    private DebtPaymentRepository debtPaymentRepository;

    @InjectMocks
    private DebtService debtService;

    private UUID testUserId;
    private UUID otherUserId;
    private Debt testDebt;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        testDebt = new Debt();
        testDebt.setId(UUID.randomUUID());
        testDebt.setUserId(testUserId);
        testDebt.setName("Credit Card");
        testDebt.setOriginalBalance(new BigDecimal("5000.00"));
        testDebt.setCurrentBalance(new BigDecimal("3000.00"));
        testDebt.setApr(new BigDecimal("18.99"));
        testDebt.setMinimumPayment(new BigDecimal("150.00"));
        testDebt.setDueDate(LocalDate.of(2024, 12, 31));
        testDebt.setCreatedAt(LocalDateTime.now());
        testDebt.setUpdatedAt(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    @Test
    void createDebt_ShouldSetAuthenticatedUserId_WhenValidRequest() {
        UserContextFilter.currentUserId.set(testUserId);

        DebtRequest request = new DebtRequest();
        request.setUserId(otherUserId); // Try to set different user ID
        request.setName("Credit Card");
        request.setOriginalBalance(new BigDecimal("5000.00"));
        request.setCurrentBalance(new BigDecimal("5000.00"));
        request.setApr(new BigDecimal("18.99"));
        request.setMinimumPayment(new BigDecimal("150.00"));
        request.setDueDate(LocalDate.of(2024, 12, 31));

        when(debtRepository.save(any(Debt.class))).thenReturn(testDebt);

        Debt result = debtService.createDebt(request);

        assertNotNull(result);
        // Verify that the authenticated user ID is used, not the one from request
        verify(debtRepository).save(argThat(d -> d.getUserId().equals(testUserId)));
    }

    @Test
    void createDebt_ShouldThrowSecurityException_WhenNotAuthenticated() {
        DebtRequest request = new DebtRequest();
        request.setUserId(testUserId);
        request.setName("Credit Card");
        request.setOriginalBalance(new BigDecimal("5000.00"));
        request.setCurrentBalance(new BigDecimal("5000.00"));
        request.setApr(new BigDecimal("18.99"));
        request.setMinimumPayment(new BigDecimal("150.00"));
        request.setDueDate(LocalDate.of(2024, 12, 31));

        assertThrows(SecurityException.class, () -> debtService.createDebt(request));
    }

    @Test
    void getDebtsByUser_ShouldReturnOnlyUserDebts_WhenUserIdMatches() {
        UserContextFilter.currentUserId.set(testUserId);

        List<Debt> userDebts = Arrays.asList(testDebt);
        when(debtRepository.findByUserId(testUserId)).thenReturn(userDebts);

        List<Debt> result = debtService.getDebtsByUser(testUserId);

        assertEquals(1, result.size());
        assertEquals(testDebt, result.get(0));
    }

    @Test
    void getDebtsByUser_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> debtService.getDebtsByUser(otherUserId));
    }

    @Test
    void getDebtById_ShouldReturnDebt_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(debtRepository.findById(testDebt.getId())).thenReturn(Optional.of(testDebt));

        Debt result = debtService.getDebtById(testDebt.getId());

        assertNotNull(result);
        assertEquals(testDebt, result);
    }

    @Test
    void getDebtById_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Debt otherDebt = new Debt();
        otherDebt.setId(UUID.randomUUID());
        otherDebt.setUserId(otherUserId);

        when(debtRepository.findById(otherDebt.getId())).thenReturn(Optional.of(otherDebt));

        assertThrows(SecurityException.class, () -> debtService.getDebtById(otherDebt.getId()));
    }

    @Test
    void updateDebt_ShouldUpdate_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        DebtRequest request = new DebtRequest();
        request.setName("Updated Credit Card");
        request.setCurrentBalance(new BigDecimal("2500.00"));
        request.setApr(new BigDecimal("15.99"));
        request.setMinimumPayment(new BigDecimal("100.00"));
        request.setDueDate(LocalDate.of(2025, 1, 31));

        when(debtRepository.findById(testDebt.getId())).thenReturn(Optional.of(testDebt));
        when(debtRepository.save(any(Debt.class))).thenReturn(testDebt);

        Debt result = debtService.updateDebt(testDebt.getId(), request);

        assertNotNull(result);
        verify(debtRepository).save(any(Debt.class));
    }

    @Test
    void updateDebt_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Debt otherDebt = new Debt();
        otherDebt.setId(UUID.randomUUID());
        otherDebt.setUserId(otherUserId);

        when(debtRepository.findById(otherDebt.getId())).thenReturn(Optional.of(otherDebt));

        DebtRequest request = new DebtRequest();
        assertThrows(SecurityException.class, () -> debtService.updateDebt(otherDebt.getId(), request));
    }

    @Test
    void deleteDebt_ShouldDelete_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(debtRepository.existsById(testDebt.getId())).thenReturn(true);
        doNothing().when(debtRepository).deleteById(testDebt.getId());

        debtService.deleteDebt(testDebt.getId());

        verify(debtRepository).deleteById(testDebt.getId());
    }

    @Test
    void deleteDebt_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Debt otherDebt = new Debt();
        otherDebt.setId(UUID.randomUUID());
        otherDebt.setUserId(otherUserId);

        when(debtRepository.findById(otherDebt.getId())).thenReturn(Optional.of(otherDebt));

        assertThrows(SecurityException.class, () -> debtService.deleteDebt(otherDebt.getId()));
    }

    @Test
    void createPayment_ShouldUpdateBalance_WhenUserOwnsDebt() {
        UserContextFilter.currentUserId.set(testUserId);

        DebtPaymentRequest request = new DebtPaymentRequest();
        request.setDebtId(testDebt.getId());
        request.setAmount(new BigDecimal("500.00"));
        request.setPaymentDate(LocalDate.now());
        request.setNote("Monthly payment");

        DebtPayment payment = new DebtPayment();
        payment.setId(UUID.randomUUID());
        payment.setUserId(testUserId);
        payment.setDebtId(testDebt.getId());
        payment.setAmount(new BigDecimal("500.00"));

        when(debtRepository.findById(testDebt.getId())).thenReturn(Optional.of(testDebt));
        when(debtPaymentRepository.save(any(DebtPayment.class))).thenReturn(payment);
        when(debtRepository.save(any(Debt.class))).thenReturn(testDebt);

        DebtPayment result = debtService.createPayment(request);

        assertNotNull(result);
        verify(debtPaymentRepository).save(any(DebtPayment.class));
        verify(debtRepository).save(argThat(d -> d.getCurrentBalance().compareTo(new BigDecimal("2500.00")) == 0));
    }

    @Test
    void createPayment_ShouldThrowSecurityException_WhenUserDoesNotOwnDebt() {
        UserContextFilter.currentUserId.set(testUserId);

        Debt otherDebt = new Debt();
        otherDebt.setId(UUID.randomUUID());
        otherDebt.setUserId(otherUserId);

        when(debtRepository.findById(otherDebt.getId())).thenReturn(Optional.of(otherDebt));

        DebtPaymentRequest request = new DebtPaymentRequest();
        request.setDebtId(otherDebt.getId());
        request.setAmount(new BigDecimal("500.00"));
        request.setPaymentDate(LocalDate.now());

        assertThrows(SecurityException.class, () -> debtService.createPayment(request));
    }

    @Test
    void calculateProgress_ShouldReturnCorrectPercentage() {
        UserContextFilter.currentUserId.set(testUserId);

        when(debtRepository.findById(testDebt.getId())).thenReturn(Optional.of(testDebt));

        BigDecimal progress = debtService.calculateProgress(testDebt.getId());

        // (5000 - 3000) / 5000 * 100 = 40%
        assertEquals(new BigDecimal("40.0000"), progress);
    }

    @Test
    void calculateProgress_ShouldThrowSecurityException_WhenUserDoesNotOwnDebt() {
        UserContextFilter.currentUserId.set(testUserId);

        Debt otherDebt = new Debt();
        otherDebt.setId(UUID.randomUUID());
        otherDebt.setUserId(otherUserId);

        when(debtRepository.findById(otherDebt.getId())).thenReturn(Optional.of(otherDebt));

        assertThrows(SecurityException.class, () -> debtService.calculateProgress(otherDebt.getId()));
    }
}
