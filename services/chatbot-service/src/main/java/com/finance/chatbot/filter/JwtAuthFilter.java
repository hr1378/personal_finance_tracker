package com.finance.chatbot.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * Validates the Bearer JWT on every /api/* request and exposes the verified
 * user id and token as request attributes for {@link UserContextFilter}.
 * Requests without a valid token are rejected with 401.
 */
public class JwtAuthFilter implements Filter {

    public static final String AUTH_USER_ID_ATTRIBUTE = "authenticatedUserId";
    public static final String AUTH_TOKEN_ATTRIBUTE = "authenticatedToken";

    private final SecretKey signingKey;
    private final Set<String> publicPaths;

    public JwtAuthFilter(String secret, String... publicPaths) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.publicPaths = Set.of(publicPaths);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String path = httpRequest.getRequestURI();

        if (path.startsWith("/actuator") || publicPaths.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        if (token == null) {
            reject(response);
            return;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object userId = claims.get("userId");
            if (userId == null) {
                reject(response);
                return;
            }

            httpRequest.setAttribute(AUTH_USER_ID_ATTRIBUTE, userId.toString());
            httpRequest.setAttribute(AUTH_TOKEN_ATTRIBUTE, token);
            chain.doFilter(request, response);
        } catch (Exception e) {
            reject(response);
        }
    }

    private void reject(ServletResponse response) throws IOException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpResponse.setContentType("application/json");
        httpResponse.getWriter().write("{\"error\":\"Unauthorized\"}");
    }
}
