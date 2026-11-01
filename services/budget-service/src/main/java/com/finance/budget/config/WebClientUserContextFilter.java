package com.finance.budget.config;

import com.finance.budget.filter.UserContextFilter;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import reactor.core.publisher.Mono;

import java.util.UUID;

public class WebClientUserContextFilter {

    public static ExchangeFilterFunction addUserContext() {
        return (request, next) -> {
            UUID userId = UserContextFilter.currentUserId.get();
            if (userId != null) {
                ClientRequest modifiedRequest = ClientRequest.from(request)
                        .header("X-User-Id", userId.toString())
                        .build();
                return next.exchange(modifiedRequest);
            }
            return next.exchange(request);
        };
    }
}
