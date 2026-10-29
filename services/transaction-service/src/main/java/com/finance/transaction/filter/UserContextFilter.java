package com.finance.transaction.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class UserContextFilter implements Filter {

    public static final ThreadLocal<UUID> currentUserId = new ThreadLocal<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String userIdHeader = httpRequest.getHeader("X-User-Id");

        if (userIdHeader != null) {
            try {
                UUID userId = UUID.fromString(userIdHeader);
                currentUserId.set(userId);
            } catch (IllegalArgumentException e) {
                // Invalid UUID, continue without setting context
            }
        }

        try {
            chain.doFilter(request, response);
        } finally {
            currentUserId.remove();
        }
    }
}
