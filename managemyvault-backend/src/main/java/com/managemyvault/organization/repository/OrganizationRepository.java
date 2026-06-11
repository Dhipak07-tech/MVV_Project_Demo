package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.OrganizationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Optional<Organization> findByIdAndDeletedFalse(UUID id);

    /**
     * Search organizations with optional filters.
     * No N+1 — single query with all filters applied.
     */
    @Query("""
        SELECT o FROM Organization o
        WHERE o.deleted = false
          AND (:search IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(o.slug) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR o.status = :status)
          AND (:industry IS NULL OR LOWER(o.industry) = LOWER(:industry))
        ORDER BY o.name ASC
    """)
    Page<Organization> searchOrganizations(
            @Param("search") String search,
            @Param("status") OrganizationStatus status,
            @Param("industry") String industry,
            Pageable pageable
    );

    @Query("SELECT COUNT(o) FROM Organization o WHERE o.deleted = false")
    long countActive();

    @Query("SELECT COUNT(o) FROM Organization o WHERE o.deleted = false AND o.status = :status")
    long countByStatus(@Param("status") OrganizationStatus status);
}
