package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Relationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RelationshipRepository extends JpaRepository<Relationship, UUID> {
    
    List<Relationship> findBySourceTypeAndSourceIdOrTargetTypeAndTargetId(
            String sourceType, UUID sourceId, String targetType, UUID targetId);

    boolean existsByOrganizationIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
            UUID organizationId, String sourceType, UUID sourceId, String targetType, UUID targetId);
}
