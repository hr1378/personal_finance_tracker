package com.finance.account.service;

import com.finance.account.dto.CardRequest;
import com.finance.account.filter.UserContextFilter;
import com.finance.account.model.Card;
import com.finance.account.repository.AccountRepository;
import com.finance.account.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CardService {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;

    public CardService(CardRepository cardRepository, AccountRepository accountRepository) {
        this.cardRepository = cardRepository;
        this.accountRepository = accountRepository;
    }

    private UUID getCurrentUserId() {
        UUID userId = UserContextFilter.currentUserId.get();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        return userId;
    }

    private void verifyOwnership(UUID cardId, UUID userId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + cardId));

        if (!card.getUserId().equals(userId)) {
            throw new SecurityException("Access denied: Card does not belong to user");
        }
    }

    private void verifyLinkedAccount(UUID accountId, UUID userId) {
        if (accountId == null) {
            return;
        }
        accountRepository.findById(accountId)
                .filter(account -> account.getUserId().equals(userId))
                .orElseThrow(() -> new SecurityException("Access denied: Linked account does not belong to user"));
    }

    public Card createCard(CardRequest request) {
        UUID currentUserId = getCurrentUserId();
        verifyLinkedAccount(request.getAccountId(), currentUserId);

        Card card = new Card();
        card.setUserId(currentUserId);
        card.setAccountId(request.getAccountId());
        card.setName(request.getName());
        card.setCardType(request.getCardType());
        card.setLastFour(request.getLastFour());
        card.setNetwork(request.getNetwork());
        card.setCreditLimit(request.getCreditLimit());
        card.setCurrentBalance(request.getCurrentBalance() != null ? request.getCurrentBalance() : java.math.BigDecimal.ZERO);
        card.setApr(request.getApr());
        card.setExpiryMonth(request.getExpiryMonth());
        card.setExpiryYear(request.getExpiryYear());
        card.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return cardRepository.save(card);
    }

    public List<Card> getCardsByUser(UUID userId) {
        UUID currentUserId = getCurrentUserId();

        // Users can only view their own cards
        if (!userId.equals(currentUserId)) {
            throw new SecurityException("Access denied: Cannot view other user's cards");
        }

        return cardRepository.findByUserId(userId);
    }

    public List<Card> getCardsByAccount(UUID accountId) {
        UUID currentUserId = getCurrentUserId();
        verifyLinkedAccount(accountId, currentUserId);

        return cardRepository.findByAccountId(accountId);
    }

    public Card getCardById(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        return cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
    }

    public Card updateCard(UUID id, CardRequest request) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);
        verifyLinkedAccount(request.getAccountId(), currentUserId);

        Card card = getCardById(id);
        card.setAccountId(request.getAccountId());
        card.setName(request.getName());
        card.setCardType(request.getCardType());
        card.setLastFour(request.getLastFour());
        card.setNetwork(request.getNetwork());
        card.setCreditLimit(request.getCreditLimit());
        card.setCurrentBalance(request.getCurrentBalance());
        card.setApr(request.getApr());
        card.setExpiryMonth(request.getExpiryMonth());
        card.setExpiryYear(request.getExpiryYear());
        if (request.getIsActive() != null) {
            card.setIsActive(request.getIsActive());
        }
        card.setUpdatedAt(LocalDateTime.now());
        return cardRepository.save(card);
    }

    public void deleteCard(UUID id) {
        UUID currentUserId = getCurrentUserId();
        verifyOwnership(id, currentUserId);

        if (!cardRepository.existsById(id)) {
            throw new RuntimeException("Card not found");
        }
        cardRepository.deleteById(id);
    }
}
