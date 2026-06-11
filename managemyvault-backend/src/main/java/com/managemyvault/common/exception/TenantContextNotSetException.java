package com.managemyvault.common.exception;

/**
 * Thrown when tenant context (organization_id) is not set for a request
 * that requires it.
 */
public class TenantContextNotSetException extends RuntimeException {

    public TenantContextNotSetException(String message) {
        super(message);
    }
}
