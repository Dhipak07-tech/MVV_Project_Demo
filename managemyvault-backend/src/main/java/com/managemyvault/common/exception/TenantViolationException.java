package com.managemyvault.common.exception;

/**
 * Thrown when a cross-tenant data access attempt is detected.
 * This is a critical security violation.
 */
public class TenantViolationException extends RuntimeException {

    public TenantViolationException(String message) {
        super(message);
    }
}
