package com.finance.account.controller;

import com.finance.account.dto.CardRequest;
import com.finance.account.model.Card;
import com.finance.account.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PostMapping
    public ResponseEntity<Card> createCard(@Valid @RequestBody CardRequest request) {
        Card card = cardService.createCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(card);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Card>> getCardsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(cardService.getCardsByUser(userId));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Card>> getCardsByAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(cardService.getCardsByAccount(accountId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Card> getCardById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(cardService.getCardById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable UUID id, @Valid @RequestBody CardRequest request) {
        try {
            return ResponseEntity.ok(cardService.updateCard(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable UUID id) {
        try {
            cardService.deleteCard(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
