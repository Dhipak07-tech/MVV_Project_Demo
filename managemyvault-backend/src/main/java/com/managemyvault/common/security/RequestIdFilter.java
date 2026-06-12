package com.managemyvault.common.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Filter to capture/generate a unique request ID (trace ID) per request.
 * Propagates X-Request-ID to logs via MDC and sets it in the HTTP response.
 * Enforced at highest priority (Ordered.HIGHEST_PRECEDENCE) to trace the entire request cycle.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String MDC_REQUEST_ID_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.trim().isEmpty()) {
                requestId = UUID.randomUUID().toString();
            }

            MDC.put(MDC_REQUEST_ID_KEY, requestId);
            httpResponse.setHeader(REQUEST_ID_HEADER, requestId);

            try {
                chain.doFilter(request, response);
            } finally {
                MDC.remove(MDC_REQUEST_ID_KEY);
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
