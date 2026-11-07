package com.finance.account.service;

import com.finance.account.dto.AccountRequest;
import com.finance.account.filter.UserContextFilter;
import com.finance.account.model.Account;
import com.finance.account.model.AccountType;
import com.finance.account.repository.AccountRepository;
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
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private UUID testUserId;
    private UUID otherUserId;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setId(UUID.randomUUID());
        testAccount.setUserId(testUserId);
        testAccount.setName("Everyday Checking");
        testAccount.setInstitution("Chase");
        testAccount.setAccountType(AccountType.CHECKING);
        testAccount.setCurrency("USD");
        testAccount.setCurrentBalance(new BigDecimal("2500.00"));
        testAccount.setIsActive(true);
        testAccount.setCreatedAt(LocalDateTime.now());
        testAccount.setUpdatedAt(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    private AccountRequest validRequest() {
        AccountRequest request = new AccountRequest();
        request.setUserId(otherUserId); // Try to set different user ID
        request.setName("Everyday Checking");
        request.setInstitution("Chase");
        request.setAccountType(AccountType.CHECKING);
        request.setCurrency("USD");
        request.setCurrentBalance(new BigDecimal("2500.00"));
        return request;
    }

    @Test
    void createAccount_ShouldSetAuthenticatedUserId_WhenValidRequest() {
        UserContextFilter.currentUserId.set(testUserId);

        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Account result = accountService.createAccount(validRequest());

        assertNotNull(result);
        // Verify that the authenticated user ID is used, not the one from request
        verify(accountRepository).save(argThat(a -> a.getUserId().equals(testUserId)));
    }

    @Test
    void createAccount_ShouldThrowSecurityException_WhenNotAuthenticated() {
        assertThrows(SecurityException.class, () -> accountService.createAccount(validRequest()));
    }

    @Test
    void createAccount_ShouldDefaultCurrencyAndActive_WhenNotProvided() {
        UserContextFilter.currentUserId.set(testUserId);

        AccountRequest request = validRequest();
        request.setCurrency(null);
        request.setIsActive(null);

        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));

        Account result = accountService.createAccount(request);

        assertEquals("USD", result.getCurrency());
        assertTrue(result.getIsActive());
    }

    @Test
    void getAccountsByUser_ShouldReturnOnlyUserAccounts_WhenUserIdMatches() {
        UserContextFilter.currentUserId.set(testUserId);

        List<Account> userAccounts = Arrays.asList(testAccount);
        when(accountRepository.findByUserId(testUserId)).thenReturn(userAccounts);

        List<Account> result = accountService.getAccountsByUser(testUserId);

        assertEquals(1, result.size());
        assertEquals(testAccount, result.get(0));
    }

    @Test
    void getAccountsByUser_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> accountService.getAccountsByUser(otherUserId));
    }

    @Test
    void getAccountById_ShouldReturnAccount_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(accountRepository.findById(testAccount.getId())).thenReturn(Optional.of(testAccount));

        Account result = accountService.getAccountById(testAccount.getId());

        assertNotNull(result);
        assertEquals(testAccount, result);
    }

    @Test
    void getAccountById_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Account otherAccount = new Account();
        otherAccount.setId(UUID.randomUUID());
        otherAccount.setUserId(otherUserId);

        when(accountRepository.findById(otherAccount.getId())).thenReturn(Optional.of(otherAccount));

        assertThrows(SecurityException.class, () -> accountService.getAccountById(otherAccount.getId()));
    }

    @Test
    void updateAccount_ShouldUpdate_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        AccountRequest request = validRequest();
        request.setName("Updated Checking");
        request.setCurrentBalance(new BigDecimal("3000.00"));
        request.setAccountType(AccountType.SAVINGS);

        when(accountRepository.findById(testAccount.getId())).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Account result = accountService.updateAccount(testAccount.getId(), request);

        assertNotNull(result);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void updateAccount_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Account otherAccount = new Account();
        otherAccount.setId(UUID.randomUUID());
        otherAccount.setUserId(otherUserId);

        when(accountRepository.findById(otherAccount.getId())).thenReturn(Optional.of(otherAccount));

        assertThrows(SecurityException.class, () -> accountService.updateAccount(otherAccount.getId(), validRequest()));
    }

    @Test
    void deleteAccount_ShouldDelete_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(accountRepository.findById(testAccount.getId())).thenReturn(Optional.of(testAccount));
        when(accountRepository.existsById(testAccount.getId())).thenReturn(true);
        doNothing().when(accountRepository).deleteById(testAccount.getId());

        accountService.deleteAccount(testAccount.getId());

        verify(accountRepository).deleteById(testAccount.getId());
    }

    @Test
    void deleteAccount_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Account otherAccount = new Account();
        otherAccount.setId(UUID.randomUUID());
        otherAccount.setUserId(otherUserId);

        when(accountRepository.findById(otherAccount.getId())).thenReturn(Optional.of(otherAccount));

        assertThrows(SecurityException.class, () -> accountService.deleteAccount(otherAccount.getId()));
    }
}
