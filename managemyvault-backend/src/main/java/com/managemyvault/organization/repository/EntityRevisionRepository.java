package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.EntityRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityRevisionRepository extends JpaRepository<EntityRevision, UUID> {
    List<EntityRevision> findByEntityTypeAndEntityIdOrderByChangedAtDesc(String entityType, UUID entityId);
}
