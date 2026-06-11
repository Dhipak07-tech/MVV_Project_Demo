package com.managemyvault.common.config;

import com.managemyvault.common.domain.TenantContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;
import java.util.UUID;

/**
 * JPA Auditing configuration.
 * Provides the current user ID for @CreatedBy and @LastModifiedBy fields.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<UUID> auditorProvider() {
        return () -> {
            try {
                return Optional.of(TenantContext.getUserId());
            } catch (Exception e) {
                return Optional.empty();
            }
        };
    }
}
