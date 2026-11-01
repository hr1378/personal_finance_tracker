package com.finance.budget.config;

import com.finance.budget.client.TransactionClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class ClientConfig {

    @Bean
    public TransactionClient transactionClient(HttpServiceProxyFactory factory) {
        return factory.createClient(TransactionClient.class);
    }
}
