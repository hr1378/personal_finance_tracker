package com.finance.account.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class UserContextFilter implements Filter {

    public static final ThreadLocal<UUID> currentUserId = new ThreadLocal<>();
    public static final ThreadLocal<String> currentToken = new ThreadLocal<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Only trust the user identity established by JwtAuthFilter (verified JWT).
        // The raw X-User-Id header is intentionally ignored to prevent spoofing.
        Object userIdAttr = httpRequest.getAttribute(JwtAuthFilter.AUTH_USER_ID_ATTRIBUTE);
        Object tokenAttr = httpRequest.getAttribute(JwtAuthFilter.AUTH_TOKEN_ATTRIBUTE);

        if (userIdAttr != null) {
            try {
                currentUserId.set(UUID.fromString(userIdAttr.toString()));
            } catch (IllegalArgumentException ignored) {
                // Invalid user id claim, continue without setting context
            }
        }
        if (tokenAttr != null) {
            currentToken.set(tokenAttr.toString());
        }

        try {
            chain.doFilter(request, response);
        } finally {
            currentUserId.remove();
            currentToken.remove();
        }
    }
}
