package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.SiteSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteSummaryRepository extends JpaRepository<SiteSummary, UUID> {
    Optional<SiteSummary> findByOrganizationId(UUID organizationId);

    @Query("SELECT DISTINCT s FROM SiteSummary s " +
           "LEFT JOIN Contact c1 ON s.primaryContactId = c1.id " +
           "LEFT JOIN Contact c2 ON s.emergencyContact1Id = c2.id " +
           "LEFT JOIN Contact c3 ON s.emergencyContact2Id = c3.id " +
           "LEFT JOIN Contact c4 ON s.authorizationContactId = c4.id " +
           "WHERE s.organizationId = :orgId " +
           "AND (:isArchived IS NULL OR s.isArchived = :isArchived) " +
           "AND (:query IS NULL OR :query = '' OR " +
           "     LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(s.notes) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(c1.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(c2.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(c3.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(c4.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     s.id IN (SELECT r.sourceId FROM Relationship r WHERE r.sourceType = 'SITE_SUMMARY' AND r.targetType = 'LOCATION' AND r.targetId IN (SELECT l.id FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.address) LIKE LOWER(CONCAT('%', :query, '%')))) OR " +
           "     s.id IN (SELECT r.targetId FROM Relationship r WHERE r.targetType = 'SITE_SUMMARY' AND r.sourceType = 'LOCATION' AND r.sourceId IN (SELECT l.id FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.address) LIKE LOWER(CONCAT('%', :query, '%'))))" +
           ")")
    Page<SiteSummary> searchSites(
            @Param("orgId") UUID orgId,
            @Param("isArchived") Boolean isArchived,
            @Param("query") String query,
            Pageable pageable);
}
