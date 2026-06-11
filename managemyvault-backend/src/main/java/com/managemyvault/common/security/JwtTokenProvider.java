package com.managemyvault.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

/**
 * JWT token provider for generating and validating access/refresh tokens.
 * Access token: 15 min TTL, contains userId, orgId, role.
 * Refresh token: 7 day TTL, stored as HttpOnly cookie.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration,
            @Value("${app.jwt.issuer}") String issuer) {
        // Ensure key is at least 512 bits for HS512
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(secret.getBytes())
        );
        if (keyBytes.length < 64) {
            // Pad key to 64 bytes if needed for HS512
            byte[] paddedKey = new byte[64];
            System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 64));
            this.signingKey = Keys.hmacShaKeyFor(paddedKey);
        } else {
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        }
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.issuer = issuer;
    }

    /**
     * Generate an access token for a user.
     */
    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);

        JwtBuilder builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(principal.getId().toString())
                .claim("email", principal.getEmail())
                .claim("name", principal.getFullName())
                .claim("role", principal.getRole())
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiry);

        if (principal.getOrganizationId() != null) {
            builder.claim("orgId", principal.getOrganizationId().toString());
        }

        return builder.signWith(signingKey).compact();
    }

    /**
     * Generate a refresh token.
     */
    public String generateRefreshToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(principal.getId().toString())
                .claim("type", "refresh")
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extract all claims from a token.
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extract user ID from token.
     */
    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaims(token).getSubject());
    }

    /**
     * Extract organization ID from token (may be null for platform users).
     */
    public UUID extractOrganizationId(String token) {
        String orgId = extractClaims(token).get("orgId", String.class);
        return orgId != null ? UUID.fromString(orgId) : null;
    }

    /**
     * Extract role from token.
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Extract email from token.
     */
    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }

    /**
     * Extract the JTI (JWT ID) for blacklist operations.
     */
    public String extractJti(String token) {
        return extractClaims(token).getId();
    }

    /**
     * Validate a token. Returns true if valid and not expired.
     */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.debug("JWT token expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT token: {}", ex.getMessage());
        } catch (SecurityException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Get the remaining TTL in milliseconds for a token.
     */
    public long getRemainingTtl(String token) {
        Date expiration = extractClaims(token).getExpiration();
        return Math.max(0, expiration.getTime() - System.currentTimeMillis());
    }
}
