package com.finance.budget.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new io.netty.handler.timeout.ReadTimeoutHandler(10))
                        .addHandlerLast(new io.netty.handler.timeout.WriteTimeoutHandler(10)));

        return WebClient.builder()
                .baseUrl("http://transaction-service:8082")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
                .filter(WebClientUserContextFilter.addUserContext())
                .filter(ExchangeFilterFunction.ofResponseProcessor(
                        clientResponse -> {
                            HttpStatusCode status = clientResponse.statusCode();
                            if (status.is5xxServerError() || status.is4xxClientError()) {
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(body -> {
                                            System.err.println("Error from transaction service: " + status + " - " + body);
                                            return Mono.error(new RuntimeException("Transaction service error: " + status));
                                        });
                            }
                            return Mono.just(clientResponse);
                        }
                ))
                .build();
    }

    @Bean
    public HttpServiceProxyFactory httpServiceProxyFactory(WebClient webClient) {
        WebClientAdapter adapter = WebClientAdapter.create(webClient);
        adapter.setBlockTimeout(Duration.ofSeconds(10));
        return HttpServiceProxyFactory.builder(adapter).build();
    }
}
