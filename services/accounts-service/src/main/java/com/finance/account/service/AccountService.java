package com.finance.account.service;

import com.finance.account.dto.AccountRequest;
import com.finance.account.filter.UserContextFilter;
import com.finance.account.model.Account;
import com.finance.account.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    private UUID getCurrentUserId() {
        UUID userId = UserContextFilter.currentUserId.get();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        return userId;
    }

    private void verifyOwnership(UUID accountId, UUID userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        if (!account.getUserId().equals(userId)) {
            throw new SecurityException("Access denied: Account does not belong to user");
        }
    }

    public Account createAccount(AccountRequest request) {
        UUID currentUserId = getCurrentUserId();

        Account account = new Account();
        account.setUserId(currentUserId);
        account.setName(request.getName());
        account.setInstitution(request.getInstitution());
        account.setAccountType(request.getAccountType());
        account.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        account.setCurrentBalance(request.getCurrentBalance());
        account.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return accountRepository.save(account);
    }

    public List<Account> getAccountsByUser(UUID userId) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own accounts
        if (!userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's accounts");
        }

        return accountRepository.findByUserId(userId);
    }

    public Account getAccountById(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        return accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public Account updateAccount(UUID id, AccountRequest request) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        Account account = getAccountById(id);
        account.setName(request.getName());
        account.setInstitution(request.getInstitution());
        account.setAccountType(request.getAccountType());
        if (request.getCurrency() != null) {
            account.setCurrency(request.getCurrency());
        }
        account.setCurrentBalance(request.getCurrentBalance());
        if (request.getIsActive() != null) {
            account.setIsActive(request.getIsActive());
        }
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }

    public void deleteAccount(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Account not found");
        }
        accountRepository.deleteById(id);
    }
}
