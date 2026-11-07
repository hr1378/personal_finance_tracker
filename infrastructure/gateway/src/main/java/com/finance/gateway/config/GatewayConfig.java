package com.finance.gateway.config;

import com.finance.gateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class GatewayConfig {

    @Autowired
    private Environment env;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(env);

        return builder.routes()
                .route("auth-service", r -> r.path("/api/auth/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("AUTH_SERVICE_URL", "http://localhost:8081")))
                .route("transaction-service", r -> r.path("/api/transactions/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("TRANSACTION_SERVICE_URL", "http://localhost:8082")))
                .route("budget-service", r -> r.path("/api/budgets/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("BUDGET_SERVICE_URL", "http://localhost:8083")))
                .route("debt-service", r -> r.path("/api/debts/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("DEBT_SERVICE_URL", "http://localhost:8084")))
                .route("dashboard-service", r -> r.path("/api/dashboard/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("DASHBOARD_SERVICE_URL", "http://localhost:8085")))
                .route("accounts-service", r -> r.path("/api/accounts/**", "/api/cards/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("ACCOUNTS_SERVICE_URL", "http://localhost:8086")))
                .route("chatbot-service", r -> r.path("/api/chat/**")
                        .filters(f -> f.filter(jwtFilter.apply(new Object())))
                        .uri(env.getProperty("CHATBOT_SERVICE_URL", "http://localhost:8087")))
                .build();
    }
}
