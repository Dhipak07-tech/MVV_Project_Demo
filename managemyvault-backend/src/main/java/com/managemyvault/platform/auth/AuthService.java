package com.managemyvault.platform.auth;

import com.managemyvault.common.security.JwtTokenProvider;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.platform.auth.dto.AuthResponse;
import com.managemyvault.platform.auth.dto.LoginRequest;
import com.managemyvault.platform.domain.PlatformUser;
import com.managemyvault.platform.repository.PlatformUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Authentication service for platform-level users.
 * Handles login, token refresh, and logout operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final PlatformUserRepository platformUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:jti:";

    /**
     * Authenticate a platform user and issue JWT tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        PlatformUser user = platformUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Update last login
        user.setLastLoginAt(Instant.now());
        platformUserRepository.save(user);

        // Generate tokens
        UserPrincipal principal = UserPrincipal.platformUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getPlatformRole().name()
        );

        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        log.info("Platform user logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000) // Convert to seconds
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getPlatformRole().name())
                        .build())
                .build();
    }

    /**
     * Refresh an access token using a valid refresh token.
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        // Verify it's a refresh token
        var claims = tokenProvider.extractClaims(refreshToken);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new BadCredentialsException("Token is not a refresh token");
        }

        var userId = tokenProvider.extractUserId(refreshToken);
        PlatformUser user = platformUserRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is disabled");
        }

        UserPrincipal principal = UserPrincipal.platformUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getPlatformRole().name()
        );

        // Issue new tokens (token rotation)
        String newAccessToken = tokenProvider.generateAccessToken(principal);
        String newRefreshToken = tokenProvider.generateRefreshToken(principal);

        // Blacklist the old refresh token
        blacklistToken(refreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getPlatformRole().name())
                        .build())
                .build();
    }

    /**
     * Logout by blacklisting the current token.
     */
    public void logout(String token) {
        blacklistToken(token);
        log.info("Token blacklisted for logout");
    }

    /**
     * Add a token's JTI to the Redis blacklist until it expires.
     */
    private void blacklistToken(String token) {
        try {
            String jti = tokenProvider.extractJti(token);
            long remainingTtl = tokenProvider.getRemainingTtl(token);
            if (jti != null && remainingTtl > 0) {
                redisTemplate.opsForValue().set(
                        TOKEN_BLACKLIST_PREFIX + jti,
                        "revoked",
                        Duration.ofMillis(remainingTtl)
                );
            }
        } catch (Exception e) {
            log.warn("Failed to blacklist token: {}", e.getMessage());
        }
    }
}
