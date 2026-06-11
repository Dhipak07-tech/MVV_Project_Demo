package com.managemyvault.common.security;

import com.managemyvault.common.domain.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * JWT Authentication Filter.
 * Validates Bearer tokens, sets SecurityContext, and populates TenantContext.
 * CRITICAL: TenantContext MUST be cleared in finally block.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final StringRedisTemplate redisTemplate;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String TOKEN_BLACKLIST_PREFIX = "blacklist:jti:";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);

            if (token != null && tokenProvider.validateToken(token)) {
                // Check if token is blacklisted (logout invalidation)
                String jti = tokenProvider.extractJti(token);
                if (isTokenBlacklisted(jti)) {
                    log.debug("Token JTI {} is blacklisted", jti);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Extract claims
                UUID userId = tokenProvider.extractUserId(token);
                String email = tokenProvider.extractEmail(token);
                String role = tokenProvider.extractRole(token);
                UUID orgId = tokenProvider.extractOrganizationId(token);

                // Set TenantContext
                TenantContext.setUserId(userId);
                TenantContext.setUserEmail(email);
                TenantContext.setUserRole(role);
                if (orgId != null) {
                    TenantContext.setOrganizationId(orgId);
                }

                // Build authentication
                UserPrincipal principal = orgId != null
                        ? UserPrincipal.orgMember(userId, email, "", "", role, orgId)
                        : UserPrincipal.platformUser(userId, email, "", "", role);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user {} with role {}", email, role);
            }

            filterChain.doFilter(request, response);

        } finally {
            // CRITICAL: Always clear tenant context to prevent leaks
            TenantContext.clear();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(header) && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    private boolean isTokenBlacklisted(String jti) {
        if (jti == null) return false;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(TOKEN_BLACKLIST_PREFIX + jti));
        } catch (Exception ex) {
            log.warn("Redis unavailable for blacklist check, allowing token: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }
}
