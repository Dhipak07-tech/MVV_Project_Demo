package com.managemyvault.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyvault.common.exception.ProblemDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/**
 * L6-001: Rate Limiting Filter using a Redis-backed Sliding Window Log algorithm.
 * Limits users/IPs to prevent abuse.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final int LIMIT = 100; // 100 requests
    private static final long WINDOW_MS = 60000; // per 1 minute (60,000 ms)

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = resolveRateLimitKey(request);
        long now = System.currentTimeMillis();
        String memberValue = now + ":" + UUID.randomUUID();

        try {
            // Add member with score = now
            redisTemplate.opsForZSet().add(key, memberValue, now);
            // Remove members older than (now - WINDOW_MS)
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, now - WINDOW_MS);
            // Count active requests in the sliding window
            Long count = redisTemplate.opsForZSet().zCard(key);
            // Set expiration to clean up unused keys
            redisTemplate.expire(key, Duration.ofMillis(WINDOW_MS));

            if (count != null && count > LIMIT) {
                log.warn("Rate limit exceeded for key: {} (count: {}, limit: {})", key, count, LIMIT);
                sendTooManyRequestsResponse(request, response);
                return;
            }
        } catch (Exception e) {
            // Fail open if Redis is down to guarantee service availability
            log.error("Redis error in RateLimitFilter: {}. Failing open.", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRateLimitKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal principal) {
            return "rate:limit:user:" + principal.getId();
        }
        // Fallback to client IP address
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return "rate:limit:ip:" + ip;
    }

    private void sendTooManyRequestsResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ProblemDetails details = ProblemDetails.builder()
                .type(URI.create("about:blank"))
                .title("Too Many Requests")
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .detail("Rate limit exceeded. You are allowed a maximum of " + LIMIT + " requests per minute.")
                .instance(URI.create(request.getRequestURI()))
                .timestamp(Instant.now())
                .build();

        objectMapper.writeValue(response.getWriter(), details);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }
}
