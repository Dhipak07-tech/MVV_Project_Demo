package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.ExceptionEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExceptionEntryRepository extends JpaRepository<ExceptionEntry, UUID> {

    List<ExceptionEntry> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<ExceptionEntry> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);

    Page<ExceptionEntry> findByOrganizationIdAndTypeAndTitleContainingIgnoreCase(
            UUID organizationId, String type, String title, Pageable pageable);
}
