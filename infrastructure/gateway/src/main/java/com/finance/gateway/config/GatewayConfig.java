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
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8081"))
                .route("transaction-service", r -> r.path("/api/transactions/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8082"))
                .route("budget-service", r -> r.path("/api/budgets/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8083"))
                .route("debt-service", r -> r.path("/api/debts/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8084"))
                .route("dashboard-service", r -> r.path("/api/dashboard/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:8085"))
                .build();
    }
}
