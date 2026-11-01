package com.finance.dashboard.service;

import com.finance.dashboard.dto.BudgetSummary;
import com.finance.dashboard.dto.DashboardSummary;
import com.finance.dashboard.dto.DebtSummary;
import com.finance.dashboard.filter.UserContextFilter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private WebClient transactionWebClient;

    @Mock
    private WebClient budgetWebClient;

    @Mock
    private WebClient debtWebClient;

    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;

    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private DashboardService dashboardService;

    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        UserContextFilter.currentUserId.set(testUserId);
    }

    @AfterEach
    void tearDown() {
        UserContextFilter.currentUserId.remove();
    }

    @Test
    void getDashboardSummary_ShouldReturnSummary_WhenUserIsAuthenticated() {
        when(transactionWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString(), any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(any(Class.class))).thenReturn(Mono.just(new DashboardService.TransactionSummary()));

        when(debtWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersSpec.uri(anyString(), any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(any(Class.class))).thenReturn(Flux.empty());

        when(budgetWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersSpec.uri(anyString(), any())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(any(Class.class))).thenReturn(Flux.empty());

        Mono<DashboardSummary> result = dashboardService.getDashboardSummary(testUserId);

        assertNotNull(result);
    }

    @Test
    void getDashboardSummary_ShouldThrowSecurityException_WhenUserNotAuthenticated() {
        UserContextFilter.currentUserId.remove();

        assertThrows(SecurityException.class, () -> dashboardService.getDashboardSummary(testUserId));
    }

    @Test
    void getDashboardSummary_ShouldThrowSecurityException_WhenUserIdDoesNotMatch() {
        UUID otherUserId = UUID.randomUUID();

        assertThrows(SecurityException.class, () -> dashboardService.getDashboardSummary(otherUserId));
    }
}
