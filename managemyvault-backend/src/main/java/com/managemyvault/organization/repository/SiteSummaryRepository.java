package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.SiteSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteSummaryRepository extends JpaRepository<SiteSummary, UUID> {
    Optional<SiteSummary> findByOrganizationId(UUID organizationId);
}
