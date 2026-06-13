package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.SiteSummaryRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SiteSummaryRevisionRepository extends JpaRepository<SiteSummaryRevision, UUID> {
    List<SiteSummaryRevision> findBySiteSummaryIdOrderByChangedAtDesc(UUID siteSummaryId);
}
