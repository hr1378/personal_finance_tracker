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
            String token = UserContextFilter.currentToken.get();
            if (userId != null) {
                ClientRequest.Builder builder = ClientRequest.from(request)
                        .header("X-User-Id", userId.toString());
                if (token != null) {
                    builder.header("Authorization", "Bearer " + token);
                }
                return next.exchange(builder.build());
            }
            return next.exchange(request);
        };
    }
}
