package com.finance.account.service;

import com.finance.account.dto.CardRequest;
import com.finance.account.filter.UserContextFilter;
import com.finance.account.model.Account;
import com.finance.account.model.AccountType;
import com.finance.account.model.Card;
import com.finance.account.model.CardNetwork;
import com.finance.account.model.CardType;
import com.finance.account.repository.AccountRepository;
import com.finance.account.repository.CardRepository;
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
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private CardService cardService;

    private UUID testUserId;
    private UUID otherUserId;
    private Card testCard;
    private Account testAccount;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setId(UUID.randomUUID());
        testAccount.setUserId(testUserId);
        testAccount.setName("Everyday Checking");
        testAccount.setAccountType(AccountType.CHECKING);
        testAccount.setCurrentBalance(new BigDecimal("2500.00"));

        testCard = new Card();
        testCard.setId(UUID.randomUUID());
        testCard.setUserId(testUserId);
        testCard.setAccountId(testAccount.getId());
        testCard.setName("Chase Sapphire");
        testCard.setCardType(CardType.CREDIT);
        testCard.setLastFour("4242");
        testCard.setNetwork(CardNetwork.VISA);
        testCard.setCreditLimit(new BigDecimal("10000.00"));
        testCard.setCurrentBalance(new BigDecimal("1200.00"));
        testCard.setApr(new BigDecimal("19.99"));
        testCard.setExpiryMonth(12);
        testCard.setExpiryYear(2027);
        testCard.setIsActive(true);
        testCard.setCreatedAt(LocalDateTime.now());
        testCard.setUpdatedAt(LocalDateTime.now());
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    private CardRequest validRequest() {
        CardRequest request = new CardRequest();
        request.setUserId(otherUserId); // Try to set different user ID
        request.setAccountId(testAccount.getId());
        request.setName("Chase Sapphire");
        request.setCardType(CardType.CREDIT);
        request.setLastFour("4242");
        request.setNetwork(CardNetwork.VISA);
        request.setCreditLimit(new BigDecimal("10000.00"));
        request.setCurrentBalance(new BigDecimal("1200.00"));
        request.setApr(new BigDecimal("19.99"));
        request.setExpiryMonth(12);
        request.setExpiryYear(2027);
        return request;
    }

    @Test
    void createCard_ShouldSetAuthenticatedUserId_WhenValidRequest() {
        UserContextFilter.currentUserId.set(testUserId);

        when(accountRepository.findById(testAccount.getId())).thenReturn(Optional.of(testAccount));
        when(cardRepository.save(any(Card.class))).thenReturn(testCard);

        Card result = cardService.createCard(validRequest());

        assertNotNull(result);
        verify(cardRepository).save(argThat(c -> c.getUserId().equals(testUserId)));
    }

    @Test
    void createCard_ShouldThrowSecurityException_WhenNotAuthenticated() {
        assertThrows(SecurityException.class, () -> cardService.createCard(validRequest()));
    }

    @Test
    void createCard_ShouldThrowSecurityException_WhenLinkedAccountNotOwned() {
        UserContextFilter.currentUserId.set(testUserId);

        Account otherAccount = new Account();
        otherAccount.setId(UUID.randomUUID());
        otherAccount.setUserId(otherUserId);

        CardRequest request = validRequest();
        request.setAccountId(otherAccount.getId());

        when(accountRepository.findById(otherAccount.getId())).thenReturn(Optional.of(otherAccount));

        assertThrows(SecurityException.class, () -> cardService.createCard(request));
    }

    @Test
    void createCard_ShouldAllowNullLinkedAccount() {
        UserContextFilter.currentUserId.set(testUserId);

        CardRequest request = validRequest();
        request.setAccountId(null);

        when(cardRepository.save(any(Card.class))).thenAnswer(inv -> inv.getArgument(0));

        Card result = cardService.createCard(request);

        assertNull(result.getAccountId());
        verify(accountRepository, never()).findById(any());
    }

    @Test
    void getCardsByUser_ShouldReturnOnlyUserCards_WhenUserIdMatches() {
        UserContextFilter.currentUserId.set(testUserId);

        List<Card> userCards = Arrays.asList(testCard);
        when(cardRepository.findByUserId(testUserId)).thenReturn(userCards);

        List<Card> result = cardService.getCardsByUser(testUserId);

        assertEquals(1, result.size());
        assertEquals(testCard, result.get(0));
    }

    @Test
    void getCardsByUser_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UserContextFilter.currentUserId.set(testUserId);

        assertThrows(SecurityException.class, () -> cardService.getCardsByUser(otherUserId));
    }

    @Test
    void getCardById_ShouldReturnCard_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(cardRepository.findById(testCard.getId())).thenReturn(Optional.of(testCard));

        Card result = cardService.getCardById(testCard.getId());

        assertNotNull(result);
        assertEquals(testCard, result);
    }

    @Test
    void getCardById_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Card otherCard = new Card();
        otherCard.setId(UUID.randomUUID());
        otherCard.setUserId(otherUserId);

        when(cardRepository.findById(otherCard.getId())).thenReturn(Optional.of(otherCard));

        assertThrows(SecurityException.class, () -> cardService.getCardById(otherCard.getId()));
    }

    @Test
    void updateCard_ShouldUpdate_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        CardRequest request = validRequest();
        request.setName("Updated Card");
        request.setCurrentBalance(new BigDecimal("800.00"));

        when(cardRepository.findById(testCard.getId())).thenReturn(Optional.of(testCard));
        when(accountRepository.findById(testAccount.getId())).thenReturn(Optional.of(testAccount));
        when(cardRepository.save(any(Card.class))).thenReturn(testCard);

        Card result = cardService.updateCard(testCard.getId(), request);

        assertNotNull(result);
        verify(cardRepository).save(any(Card.class));
    }

    @Test
    void updateCard_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Card otherCard = new Card();
        otherCard.setId(UUID.randomUUID());
        otherCard.setUserId(otherUserId);

        when(cardRepository.findById(otherCard.getId())).thenReturn(Optional.of(otherCard));

        assertThrows(SecurityException.class, () -> cardService.updateCard(otherCard.getId(), validRequest()));
    }

    @Test
    void deleteCard_ShouldDelete_WhenUserOwnsIt() {
        UserContextFilter.currentUserId.set(testUserId);

        when(cardRepository.findById(testCard.getId())).thenReturn(Optional.of(testCard));
        when(cardRepository.existsById(testCard.getId())).thenReturn(true);
        doNothing().when(cardRepository).deleteById(testCard.getId());

        cardService.deleteCard(testCard.getId());

        verify(cardRepository).deleteById(testCard.getId());
    }

    @Test
    void deleteCard_ShouldThrowSecurityException_WhenUserDoesNotOwnIt() {
        UserContextFilter.currentUserId.set(testUserId);

        Card otherCard = new Card();
        otherCard.setId(UUID.randomUUID());
        otherCard.setUserId(otherUserId);

        when(cardRepository.findById(otherCard.getId())).thenReturn(Optional.of(otherCard));

        assertThrows(SecurityException.class, () -> cardService.deleteCard(otherCard.getId()));
    }
}
