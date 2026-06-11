package com.managemyvault.platform.auth;

import com.managemyvault.platform.auth.dto.AuthResponse;
import com.managemyvault.platform.auth.dto.LoginRequest;
import com.managemyvault.platform.auth.dto.RefreshTokenRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for platform-level login.
 * All endpoints are public (permitAll in SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Platform user login.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh access token using a valid refresh token.
     * Implements token rotation: old refresh token is invalidated.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Logout — blacklists the current access token.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            authService.logout(header.substring(7));
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Get current authenticated user info.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserInfo> me(
            @RequestHeader("Authorization") String authHeader) {
        // This endpoint requires authentication (not in the permitAll list for /auth/**)
        // The JWT filter will populate the security context
        return ResponseEntity.ok().build();
    }
}
