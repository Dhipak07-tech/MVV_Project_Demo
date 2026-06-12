package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Relationship;
import com.managemyvault.organization.repository.RelationshipRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RelationshipService {

    private final RelationshipRepository relationshipRepository;
    private final ActivityEventService activityEventService;

    @PersistenceContext
    private EntityManager entityManager;

    @Getter
    @Builder
    public static class RelationshipDto {
        private UUID id;
        private String relatedEntityType;
        private UUID relatedEntityId;
        private String relatedEntityName;
        private Instant createdAt;
    }

    private String getTableName(String type) {
        if (type == null) return null;
        return switch (type.toLowerCase()) {
            case "contact" -> "contacts";
            case "location" -> "locations";
            case "asset" -> "assets";
            case "document" -> "documents";
            case "password" -> "passwords";
            case "appservice", "application" -> "app_services";
            case "vendor" -> "vendors";
            case "backupsolution" -> "backup_solutions";
            default -> null;
        };
    }

    private String getColumnName(String type) {
        if (type == null) return "name";
        return switch (type.toLowerCase()) {
            case "document" -> "title";
            default -> "name";
        };
    }

    private String getEntityName(String type, UUID id) {
        String tableName = getTableName(type);
        if (tableName == null) {
            return type + " (" + id.toString().substring(0, 8) + ")";
        }
        String columnName = getColumnName(type);
        try {
            String sql = "SELECT " + columnName + " FROM " + tableName + " WHERE id = :id";
            Object result = entityManager.createNativeQuery(sql)
                    .setParameter("id", id)
                    .getSingleResult();
            return result != null ? result.toString() : "Unnamed";
        } catch (Exception e) {
            return type + " (" + id.toString().substring(0, 8) + ")";
        }
    }

    @Transactional
    public Relationship link(UUID orgId, String sourceType, UUID sourceId, String targetType, UUID targetId, UUID userId) {
        // Prevent duplicate relationships
        boolean exists = relationshipRepository.existsByOrganizationIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
                orgId, sourceType, sourceId, targetType, targetId);
        
        // Check reverse direction as well
        boolean reverseExists = relationshipRepository.existsByOrganizationIdAndSourceTypeAndSourceIdAndTargetTypeAndTargetId(
                orgId, targetType, targetId, sourceType, sourceId);

        if (exists || reverseExists) {
            log.info("Relationship already exists between {}/{} and {}/{}", sourceType, sourceId, targetType, targetId);
            return null;
        }

        Relationship relationship = Relationship.builder()
                .organizationId(orgId)
                .sourceType(sourceType)
                .sourceId(sourceId)
                .targetType(targetType)
                .targetId(targetId)
                .createdBy(userId)
                .build();

        Relationship saved = relationshipRepository.save(relationship);
        
        String targetName = getEntityName(targetType, targetId);
        String sourceName = getEntityName(sourceType, sourceId);
        activityEventService.logEvent(orgId, sourceType, sourceId, "RELATIONSHIP_CREATE", userId, targetType + ": " + targetName);
        activityEventService.logEvent(orgId, targetType, targetId, "RELATIONSHIP_CREATE", userId, sourceType + ": " + sourceName);

        return saved;
    }

    @Transactional(readOnly = true)
    public Relationship getById(UUID id) {
        return relationshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Relationship", id.toString()));
    }

    @Transactional
    public void unlink(UUID id, UUID userId) {
        Relationship relationship = getById(id);

        relationshipRepository.delete(relationship);

        String targetName = getEntityName(relationship.getTargetType(), relationship.getTargetId());
        String sourceName = getEntityName(relationship.getSourceType(), relationship.getSourceId());
        activityEventService.logEvent(relationship.getOrganizationId(), 
                relationship.getSourceType(), relationship.getSourceId(), "RELATIONSHIP_DELETE", userId, relationship.getTargetType() + ": " + targetName);
        activityEventService.logEvent(relationship.getOrganizationId(), 
                relationship.getTargetType(), relationship.getTargetId(), "RELATIONSHIP_DELETE", userId, relationship.getSourceType() + ": " + sourceName);
    }

    @Transactional(readOnly = true)
    public List<RelationshipDto> getRelationshipsForEntity(String entityType, UUID entityId) {
        List<Relationship> list = relationshipRepository.findBySourceTypeAndSourceIdOrTargetTypeAndTargetId(
                entityType, entityId, entityType, entityId);

        List<RelationshipDto> dtos = new ArrayList<>();
        for (Relationship r : list) {
            boolean isSource = r.getSourceType().equalsIgnoreCase(entityType) && r.getSourceId().equals(entityId);
            
            String relatedType = isSource ? r.getTargetType() : r.getSourceType();
            UUID relatedId = isSource ? r.getTargetId() : r.getSourceId();
            String relatedName = getEntityName(relatedType, relatedId);

            dtos.add(RelationshipDto.builder()
                    .id(r.getId())
                    .relatedEntityType(relatedType)
                    .relatedEntityId(relatedId)
                    .relatedEntityName(relatedName)
                    .createdAt(r.getCreatedAt())
                    .build());
        }
        return dtos;
    }
}
