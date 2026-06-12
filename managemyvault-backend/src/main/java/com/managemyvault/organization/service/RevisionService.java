package com.managemyvault.organization.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyvault.organization.domain.EntityRevision;
import com.managemyvault.organization.repository.EntityRevisionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Builder;
import lombok.Getter;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisionService {

    private final EntityRevisionRepository entityRevisionRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Getter
    @Builder
    public static class EntityRevisionDto {
        private UUID id;
        private String entityType;
        private UUID entityId;
        private String beforeState;
        private String afterState;
        private UUID changedBy;
        private String changedByName;
        private Instant changedAt;
    }

    @Transactional
    public void saveRevision(String entityType, UUID entityId, Object before, Object after, UUID userId) {
        try {
            String beforeState = before != null ? objectMapper.writeValueAsString(before) : null;
            String afterState = after != null ? objectMapper.writeValueAsString(after) : null;

            EntityRevision revision = EntityRevision.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .beforeState(beforeState)
                    .afterState(afterState)
                    .changedBy(userId)
                    .changedAt(Instant.now())
                    .build();
            entityRevisionRepository.save(revision);
            log.debug("Saved EntityRevision for {}/{}", entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to save entity revision for {}/{}: {}", entityType, entityId, e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<EntityRevisionDto> getRevisions(String entityType, UUID entityId) {
        List<EntityRevision> list = entityRevisionRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId);
        List<EntityRevisionDto> dtos = new ArrayList<>();
        for (EntityRevision r : list) {
            String changedByName = "System User";
            if (r.getChangedBy() != null) {
                try {
                    Object fullName = entityManager.createNativeQuery(
                            "SELECT full_name FROM platform_users WHERE id = :userId")
                            .setParameter("userId", r.getChangedBy())
                            .getSingleResult();
                    if (fullName != null) {
                        changedByName = fullName.toString();
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
            dtos.add(EntityRevisionDto.builder()
                    .id(r.getId())
                    .entityType(r.getEntityType())
                    .entityId(r.getEntityId())
                    .beforeState(r.getBeforeState())
                    .afterState(r.getAfterState())
                    .changedBy(r.getChangedBy())
                    .changedByName(changedByName)
                    .changedAt(r.getChangedAt())
                    .build());
        }
        return dtos;
    }
}
