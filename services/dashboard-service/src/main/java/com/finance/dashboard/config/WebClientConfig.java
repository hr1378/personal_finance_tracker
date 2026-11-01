package com.finance.dashboard.config;

import com.finance.dashboard.filter.UserContextFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.UUID;

@Configuration
public class WebClientConfig {

    private static ExchangeFilterFunction addUserContext() {
        return (request, next) -> {
            UUID userId = UserContextFilter.currentUserId.get();
            if (userId != null) {
                org.springframework.web.reactive.function.client.ClientRequest modifiedRequest =
                        org.springframework.web.reactive.function.client.ClientRequest.from(request)
                                .header("X-User-Id", userId.toString())
                                .build();
                return next.exchange(modifiedRequest);
            }
            return next.exchange(request);
        };
    }

    private WebClient createWebClient(String baseUrl) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new io.netty.handler.timeout.ReadTimeoutHandler(10))
                        .addHandlerLast(new io.netty.handler.timeout.WriteTimeoutHandler(10)));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .filter(addUserContext())
                .filter(ExchangeFilterFunction.ofResponseProcessor(
                        clientResponse -> {
                            var status = clientResponse.statusCode();
                            if (status.is5xxServerError() || status.is4xxClientError()) {
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(body -> {
                                            System.err.println("Error from service: " + status + " - " + body);
                                            return Mono.error(new RuntimeException("Service error: " + status));
                                        });
                            }
                            return Mono.just(clientResponse);
                        }
                ))
                .build();
    }

    @Bean
    public WebClient transactionWebClient(@Value("${transaction.service.url}") String transactionUrl) {
        return createWebClient(transactionUrl);
    }

    @Bean
    public WebClient budgetWebClient(@Value("${budget.service.url}") String budgetUrl) {
        return createWebClient(budgetUrl);
    }

    @Bean
    public WebClient debtWebClient(@Value("${debt.service.url}") String debtUrl) {
        return createWebClient(debtUrl);
    }
}
