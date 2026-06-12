package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.LegacySiteSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LegacySiteSummaryRepository extends JpaRepository<LegacySiteSummary, UUID> {
    List<LegacySiteSummary> findByOrganizationId(UUID organizationId);
}
