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

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisionService {

    private final EntityRevisionRepository entityRevisionRepository;
    private final ObjectMapper objectMapper;

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
    public List<EntityRevision> getRevisions(String entityType, UUID entityId) {
        return entityRevisionRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId);
    }
}
