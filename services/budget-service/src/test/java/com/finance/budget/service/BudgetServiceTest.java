package com.finance.budget.service;

import com.finance.budget.dto.BudgetRequest;
import com.finance.budget.filter.UserContextFilter;
import com.finance.budget.model.Budget;
import com.finance.budget.repository.BudgetRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private BudgetService budgetService;

    private UUID testUserId;
    private UUID otherUserId;
    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        testBudget = new Budget();
        testBudget.setId(UUID.randomUUID());
        testBudget.setUserId(testUserId);
        testBudget.setCategory("Groceries");
        testBudget.setMonth(1);
        testBudget.setYear(2024);
        testBudget.setSpendingLimit(new BigDecimal("500.00"));
        testBudget.setCreatedAt(LocalDateTime.now());
        testBudget.setUpdatedAt(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    @Test
    void createBudget_ShouldSetAuthenticatedUserId_WhenValidRequest() {
        UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request = new BudgetRequest();
        request.setUserId(otherUserId); // Try to set different user ID
        request.setCategory("Groceries");
        request.setMonth(1);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("500.00"));

        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        Budget result = budgetService.createBudget(request);

        assertNotNull(result);
        // Verify that the authenticated user ID is used, not the one from request
        verify(budgetRepository).save(argThat(b -> b.getUserId().equals(testUserId)));
    }

    @Test
    void createBudget_ShouldThrowSecurityException_WhenNotAuthenticated() {
        BudgetRequest request = new BudgetRequest();
        request.setUserId(testUserId);
        request.setCategory("Groceries");
        request.setMonth(1);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("500.00"));

        assertThrows(SecurityException.class, () -> budgetService.createBudget(request));
    }

    @Test
    void getBudgetsByUser_ShouldReturnOnlyUserBudgets_WhenUserIdMatches() {
        UserContextFilter.currentUserId.set(testUserId);

        List<Budget> userBudgets = Arrays.asList(testBudget);
        when(budgetRepository.findByUserId(testUserId)).thenReturn(userBudgets);

        List<Budget> result = budgetService.getBudgetsByUser(testUserId);

        assertEquals(1, result.size());
        assertEquals(testBudget, result.get(0));
    }

    @Test
    void getBudgetsByUser_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> budgetService.getBudgetsByUser(otherUserId));
    }

    @Test
    void getBudgetById_ShouldReturnBudget_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(budgetRepository.findById(testBudget.getId())).thenReturn(Optional.of(testBudget));

        Budget result = budgetService.getBudgetById(testBudget.getId());

        assertNotNull(result);
        assertEquals(testBudget, result);
    }

    @Test
    void getBudgetById_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Budget otherBudget = new Budget();
        otherBudget.setId(UUID.randomUUID());
        otherBudget.setUserId(otherUserId);

        when(budgetRepository.findById(otherBudget.getId())).thenReturn(Optional.of(otherBudget));

        assertThrows(SecurityException.class, () -> budgetService.getBudgetById(otherBudget.getId()));
    }

    @Test
    void updateBudget_ShouldUpdate_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        BudgetRequest request = new BudgetRequest();
        request.setCategory("Entertainment");
        request.setMonth(2);
        request.setYear(2024);
        request.setSpendingLimit(new BigDecimal("300.00"));

        when(budgetRepository.findById(testBudget.getId())).thenReturn(Optional.of(testBudget));
        when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

        Budget result = budgetService.updateBudget(testBudget.getId(), request);

        assertNotNull(result);
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void updateBudget_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Budget otherBudget = new Budget();
        otherBudget.setId(UUID.randomUUID());
        otherBudget.setUserId(otherUserId);

        when(budgetRepository.findById(otherBudget.getId())).thenReturn(Optional.of(otherBudget));

        BudgetRequest request = new BudgetRequest();
        assertThrows(SecurityException.class, () -> budgetService.updateBudget(otherBudget.getId(), request));
    }

    @Test
    void deleteBudget_ShouldDelete_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(budgetRepository.existsById(testBudget.getId())).thenReturn(true);
        doNothing().when(budgetRepository).deleteById(testBudget.getId());

        budgetService.deleteBudget(testBudget.getId());

        verify(budgetRepository).deleteById(testBudget.getId());
    }

    @Test
    void deleteBudget_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Budget otherBudget = new Budget();
        otherBudget.setId(UUID.randomUUID());
        otherBudget.setUserId(otherUserId);

        when(budgetRepository.findById(otherBudget.getId())).thenReturn(Optional.of(otherBudget));

        assertThrows(SecurityException.class, () -> budgetService.deleteBudget(otherBudget.getId()));
    }
}
