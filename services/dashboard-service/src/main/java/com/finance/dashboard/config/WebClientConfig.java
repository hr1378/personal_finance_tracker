package com.finance.dashboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient transactionWebClient(@Value("${transaction.service.url}") String transactionUrl) {
        return WebClient.builder()
                .baseUrl(transactionUrl)
                .build();
    }

    @Bean
    public WebClient budgetWebClient(@Value("${budget.service.url}") String budgetUrl) {
        return WebClient.builder()
                .baseUrl(budgetUrl)
                .build();
    }

    @Bean
    public WebClient debtWebClient(@Value("${debt.service.url}") String debtUrl) {
        return WebClient.builder()
                .baseUrl(debtUrl)
                .build();
    }
}
