package com.managemyvault.common.domain;

import com.managemyvault.common.exception.TenantContextNotSetException;

import java.util.UUID;

/**
 * ThreadLocal tenant context holder.
 * Set per-request by TenantContextFilter, cleared in finally block.
 * CRITICAL: Must be cleared to prevent context leak across virtual thread reuse.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_ORGANIZATION = new ThreadLocal<>();
    private static final ThreadLocal<UUID> CURRENT_USER = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER_ROLE = new ThreadLocal<>();
    private static final ThreadLocal<String> CURRENT_USER_EMAIL = new ThreadLocal<>();

    private TenantContext() {
        // Utility class, no instantiation
    }

    // --- Organization ---

    public static void setOrganizationId(UUID orgId) {
        CURRENT_ORGANIZATION.set(orgId);
    }

    public static UUID getOrganizationId() {
        UUID orgId = CURRENT_ORGANIZATION.get();
        if (orgId == null) {
            throw new TenantContextNotSetException(
                "Tenant context has not been initialized for this request"
            );
        }
        return orgId;
    }

    public static UUID getOrganizationIdOrNull() {
        return CURRENT_ORGANIZATION.get();
    }

    // --- User ---

    public static void setUserId(UUID userId) {
        CURRENT_USER.set(userId);
    }

    public static UUID getUserId() {
        UUID userId = CURRENT_USER.get();
        if (userId == null) {
            throw new TenantContextNotSetException(
                "User context has not been initialized for this request"
            );
        }
        return userId;
    }

    // --- Role ---

    public static void setUserRole(String role) {
        CURRENT_USER_ROLE.set(role);
    }

    public static String getUserRole() {
        return CURRENT_USER_ROLE.get();
    }

    // --- Email ---

    public static void setUserEmail(String email) {
        CURRENT_USER_EMAIL.set(email);
    }

    public static String getUserEmail() {
        return CURRENT_USER_EMAIL.get();
    }

    // --- Lifecycle ---

    public static void clear() {
        CURRENT_ORGANIZATION.remove();
        CURRENT_USER.remove();
        CURRENT_USER_ROLE.remove();
        CURRENT_USER_EMAIL.remove();
    }
}
