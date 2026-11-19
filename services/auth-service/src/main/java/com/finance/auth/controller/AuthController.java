package com.finance.auth.controller;

import com.finance.auth.dto.AuthResponse;
import com.finance.auth.dto.LoginRequest;
import com.finance.auth.dto.RefreshRequest;
import com.finance.auth.dto.RegisterRequest;
import com.finance.auth.model.User;
import com.finance.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

    private final AuthService authService;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.register(request);
            return issueResponse(response, httpResponse, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletResponse httpResponse) {
        try {
            AuthResponse response = authService.login(request);
            return issueResponse(response, httpResponse, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody(required = false) RefreshRequest request,
            @CookieValue(name = REFRESH_COOKIE, required = false) String cookieToken,
            HttpServletResponse httpResponse) {
        String token = resolveRefreshToken(request, cookieToken);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            AuthResponse response = authService.refresh(new RefreshRequest(token));
            return issueResponse(response, httpResponse, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) RefreshRequest request,
            @CookieValue(name = REFRESH_COOKIE, required = false) String cookieToken,
            HttpServletResponse httpResponse) {
        String token = resolveRefreshToken(request, cookieToken);
        if (token != null) {
            authService.logout(new RefreshRequest(token));
        }
        clearRefreshCookie(httpResponse);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<User> getUser(@PathVariable UUID userId, HttpServletRequest request) {
        String callerId = (String) request.getAttribute("userId");
        if (callerId == null || !callerId.equals(userId.toString())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            User user = authService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<AuthResponse> issueResponse(AuthResponse auth, HttpServletResponse httpResponse,
                                                       HttpStatus status) {
        // The refresh token is delivered only via an httpOnly cookie so it is
        // never exposed to JavaScript. Strip it from the JSON body.
        setRefreshCookie(httpResponse, auth.getRefreshToken());
        auth.setRefreshToken(null);
        return ResponseEntity.status(status).body(auth);
    }

    private String resolveRefreshToken(RefreshRequest request, String cookieToken) {
        String token = request != null ? request.getRefreshToken() : null;
        if (token == null || token.isBlank()) {
            token = cookieToken;
        }
        return (token == null || token.isBlank()) ? null : token;
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        if (token == null) {
            return;
        }
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(token, REFRESH_COOKIE_MAX_AGE));
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", 0));
    }

    private String buildCookie(String value, int maxAge) {
        StringBuilder cookie = new StringBuilder(REFRESH_COOKIE)
                .append('=').append(value)
                .append("; Path=/api/auth; HttpOnly; SameSite=Strict; Max-Age=").append(maxAge);
        if (cookieSecure) {
            cookie.append("; Secure");
        }
        return cookie.toString();
    }
}
