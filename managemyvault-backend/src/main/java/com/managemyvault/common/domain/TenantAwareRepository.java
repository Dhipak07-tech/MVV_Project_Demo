package com.managemyvault.common.domain;

import com.managemyvault.common.exception.TenantViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.UUID;

/**
 * Base repository interface enforcing tenant isolation at the data access layer.
 * All tenant-scoped repositories MUST extend this interface.
 */
@NoRepositoryBean
public interface TenantAwareRepository<T, ID> extends JpaRepository<T, ID> {

    /**
     * Assert that the entity belongs to the current tenant context.
     * Throws TenantViolationException if there's a mismatch.
     */
    default void assertTenantMatch(UUID entityOrgId) {
        UUID currentOrgId = TenantContext.getOrganizationId();
        if (!currentOrgId.equals(entityOrgId)) {
            throw new TenantViolationException(
                "Tenant isolation violation: requested entity belongs to a different organization"
            );
        }
    }
}
