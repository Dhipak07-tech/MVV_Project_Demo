package com.managemyvault.platform.auth;

import com.managemyvault.common.security.JwtTokenProvider;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.platform.auth.dto.AuthResponse;
import com.managemyvault.platform.auth.dto.LoginRequest;
import com.managemyvault.platform.auth.dto.OrgLoginRequest;
import com.managemyvault.platform.domain.PlatformUser;
import com.managemyvault.platform.repository.PlatformUserRepository;
import com.managemyvault.organization.domain.OrganizationMember;
import com.managemyvault.organization.repository.OrganizationMemberRepository;
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
import java.util.UUID;

/**
 * Authentication service for platform-level users and organization members.
 * Handles login, token refresh, and logout operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final PlatformUserRepository platformUserRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
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
        platformUserRepository.updateLastLogin(user.getId(), Instant.now());

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
     * Authenticate an organization member and issue JWT tokens.
     */
    @Transactional
    public AuthResponse loginOrg(OrgLoginRequest request) {
        OrganizationMember member = organizationMemberRepository.findByOrganizationIdAndEmail(
                request.getOrganizationId(), request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!member.isActive()) {
            throw new BadCredentialsException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), member.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Update last login
        member.setLastLoginAt(Instant.now());
        organizationMemberRepository.save(member);

        // Generate tokens with orgId embedded
        UserPrincipal principal = UserPrincipal.orgMember(
                member.getId(),
                member.getEmail(),
                member.getPasswordHash(),
                member.getFullName(),
                member.getOrgRole().name(),
                member.getOrganizationId()
        );

        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken(principal);

        log.info("Organization member logged in: {} for org: {}", member.getEmail(), member.getOrganizationId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration / 1000)
                .user(AuthResponse.UserInfo.builder()
                        .id(member.getId().toString())
                        .email(member.getEmail())
                        .fullName(member.getFullName())
                        .role(member.getOrgRole().name())
                        .organizationId(member.getOrganizationId().toString())
                        .build())
                .build();
    }

    /**
     * Refresh an access token using a valid refresh token.
     */
    @Transactional
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
        UUID orgId = tokenProvider.extractOrganizationId(refreshToken);

        UserPrincipal principal;
        AuthResponse.UserInfo userInfo;

        if (orgId == null) {
            // Platform user refresh
            PlatformUser user = platformUserRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            if (!user.isActive()) {
                throw new BadCredentialsException("Account is disabled");
            }

            principal = UserPrincipal.platformUser(
                    user.getId(),
                    user.getEmail(),
                    user.getPasswordHash(),
                    user.getFullName(),
                    user.getPlatformRole().name()
            );

            userInfo = AuthResponse.UserInfo.builder()
                    .id(user.getId().toString())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getPlatformRole().name())
                    .build();
        } else {
            // Org member refresh
            OrganizationMember member = organizationMemberRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("Member not found"));

            if (!member.isActive()) {
                throw new BadCredentialsException("Account is disabled");
            }

            principal = UserPrincipal.orgMember(
                    member.getId(),
                    member.getEmail(),
                    member.getPasswordHash(),
                    member.getFullName(),
                    member.getOrgRole().name(),
                    member.getOrganizationId()
            );

            userInfo = AuthResponse.UserInfo.builder()
                    .id(member.getId().toString())
                    .email(member.getEmail())
                    .fullName(member.getFullName())
                    .role(member.getOrgRole().name())
                    .organizationId(member.getOrganizationId().toString())
                    .build();
        }

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
                .user(userInfo)
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
