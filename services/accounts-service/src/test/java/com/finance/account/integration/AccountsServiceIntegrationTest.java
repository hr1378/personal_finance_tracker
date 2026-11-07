package com.finance.account.integration;

import com.finance.account.dto.AccountRequest;
import com.finance.account.dto.CardRequest;
import com.finance.account.filter.UserContextFilter;
import com.finance.account.model.Account;
import com.finance.account.model.AccountType;
import com.finance.account.model.Card;
import com.finance.account.model.CardNetwork;
import com.finance.account.model.CardType;
import com.finance.account.repository.AccountRepository;
import com.finance.account.repository.CardRepository;
import com.finance.account.service.AccountService;
import com.finance.account.service.CardService;
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
        "spring.jpa.hibernate.ddl-auto=none"
})
@Testcontainers
@AutoConfigureWebMvc
class AccountsServiceIntegrationTest {

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
    private AccountService accountService;

    @Autowired
    private CardService cardService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CardRepository cardRepository;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        cardRepository.deleteAll();
        accountRepository.deleteAll();
    }

    @AfterEach
    void tearDown() {
        cardRepository.deleteAll();
        accountRepository.deleteAll();
        UserContextFilter.currentUserId.remove();
    }

    private AccountRequest accountRequest(UUID userId) {
        AccountRequest request = new AccountRequest();
        request.setUserId(userId);
        request.setName("Everyday Checking");
        request.setInstitution("Chase");
        request.setAccountType(AccountType.CHECKING);
        request.setCurrency("USD");
        request.setCurrentBalance(new BigDecimal("2500.00"));
        return request;
    }

    private CardRequest cardRequest(UUID userId, UUID accountId) {
        CardRequest request = new CardRequest();
        request.setUserId(userId);
        request.setAccountId(accountId);
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
    void createAndRetrieveAccount_ShouldWork() {
        UserContextFilter.currentUserId.set(testUserId);

        Account created = accountService.createAccount(accountRequest(testUserId));

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(testUserId, created.getUserId());
        assertEquals("Everyday Checking", created.getName());
        assertEquals(AccountType.CHECKING, created.getAccountType());
        assertEquals(new BigDecimal("2500.00"), created.getCurrentBalance());
        assertTrue(created.getIsActive());

        Account retrieved = accountService.getAccountById(created.getId());
        assertEquals(created.getId(), retrieved.getId());
        assertEquals(created.getName(), retrieved.getName());
    }

    @Test
    void getAccountsByUser_ShouldReturnOnlyUserAccounts() {
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();

        UserContextFilter.currentUserId.set(user1);
        accountService.createAccount(accountRequest(user1));

        UserContextFilter.currentUserId.set(user2);
        AccountRequest request2 = accountRequest(user2);
        request2.setName("High-Yield Savings");
        request2.setAccountType(AccountType.SAVINGS);
        accountService.createAccount(request2);

        UserContextFilter.currentUserId.set(user1);
        List<Account> user1Accounts = accountService.getAccountsByUser(user1);

        assertEquals(1, user1Accounts.size());
        assertEquals(user1, user1Accounts.get(0).getUserId());
        assertEquals("Everyday Checking", user1Accounts.get(0).getName());
    }

    @Test
    void createAndRetrieveCard_ShouldWork() {
        UserContextFilter.currentUserId.set(testUserId);

        Account account = accountService.createAccount(accountRequest(testUserId));
        Card created = cardService.createCard(cardRequest(testUserId, account.getId()));

        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(testUserId, created.getUserId());
        assertEquals(account.getId(), created.getAccountId());
        assertEquals(CardType.CREDIT, created.getCardType());
        assertEquals("4242", created.getLastFour());
        assertEquals(new BigDecimal("10000.00"), created.getCreditLimit());

        Card retrieved = cardService.getCardById(created.getId());
        assertEquals(created.getId(), retrieved.getId());
        assertEquals(created.getName(), retrieved.getName());
    }

    @Test
    void getCardsByAccount_ShouldReturnLinkedCards() {
        UserContextFilter.currentUserId.set(testUserId);

        Account account = accountService.createAccount(accountRequest(testUserId));
        cardService.createCard(cardRequest(testUserId, account.getId()));

        List<Card> cards = cardService.getCardsByAccount(account.getId());

        assertEquals(1, cards.size());
        assertEquals(account.getId(), cards.get(0).getAccountId());
    }

    @Test
    void deleteAccount_ShouldNotAffectLinkedCards() {
        UserContextFilter.currentUserId.set(testUserId);

        Account account = accountService.createAccount(accountRequest(testUserId));
        Card card = cardService.createCard(cardRequest(testUserId, account.getId()));

        accountService.deleteAccount(account.getId());

        // Card survives account deletion (FK ON DELETE SET NULL is applied by Flyway in real deployments)
        assertTrue(cardRepository.existsById(card.getId()));
    }

    @Test
    void deleteCard_ShouldRemoveFromDatabase() {
        UserContextFilter.currentUserId.set(testUserId);

        Card card = cardService.createCard(cardRequest(testUserId, null));

        cardService.deleteCard(card.getId());

        assertFalse(cardRepository.existsById(card.getId()));
    }

    @Test
    void updateAccount_ShouldPersistChanges() {
        UserContextFilter.currentUserId.set(testUserId);

        Account account = accountService.createAccount(accountRequest(testUserId));

        AccountRequest update = accountRequest(testUserId);
        update.setName("Renamed Checking");
        update.setCurrentBalance(new BigDecimal("9999.99"));
        update.setIsActive(false);

        Account updated = accountService.updateAccount(account.getId(), update);

        assertEquals("Renamed Checking", updated.getName());
        assertEquals(new BigDecimal("9999.99"), updated.getCurrentBalance());
        assertFalse(updated.getIsActive());
    }
}
