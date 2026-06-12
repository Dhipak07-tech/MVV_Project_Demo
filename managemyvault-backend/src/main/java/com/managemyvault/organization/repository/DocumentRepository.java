package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByOrganizationId(UUID organizationId);

    List<Document> findByOrganizationIdAndCategory(UUID organizationId, String category);

    Page<Document> findByOrganizationIdAndTitleContainingIgnoreCase(UUID organizationId, String title, Pageable pageable);
}
