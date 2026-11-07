package com.finance.account.controller;

import com.finance.account.dto.AccountRequest;
import com.finance.account.model.Account;
import com.finance.account.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody AccountRequest request) {
        Account account = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Account>> getAccountsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(accountService.getAccountsByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(accountService.getAccountById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable UUID id, @Valid @RequestBody AccountRequest request) {
        try {
            return ResponseEntity.ok(accountService.updateAccount(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
