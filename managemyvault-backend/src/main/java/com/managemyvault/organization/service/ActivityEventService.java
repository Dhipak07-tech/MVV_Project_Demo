package com.managemyvault.organization.service;

import com.managemyvault.organization.domain.ActivityEvent;
import com.managemyvault.organization.repository.ActivityEventRepository;
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
public class ActivityEventService {

    private final ActivityEventRepository activityEventRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Getter
    @Builder
    public static class ActivityEventDto {
        private UUID id;
        private UUID organizationId;
        private String entityType;
        private UUID entityId;
        private String action;
        private UUID userId;
        private String userName;
        private String details;
        private Instant timestamp;
    }

    @Transactional
    public void logEvent(UUID organizationId, String entityType, UUID entityId, String action, UUID userId) {
        logEvent(organizationId, entityType, entityId, action, userId, null);
    }

    @Transactional
    public void logEvent(UUID organizationId, String entityType, UUID entityId, String action, UUID userId, String details) {
        ActivityEvent event = ActivityEvent.builder()
                .organizationId(organizationId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .userId(userId)
                .details(details)
                .timestamp(Instant.now())
                .build();
        activityEventRepository.save(event);
        log.debug("Logged ActivityEvent: {} ({}) for {}/{}", action, details, entityType, entityId);
    }

    @Transactional(readOnly = true)
    public List<ActivityEventDto> getEvents(String entityType, UUID entityId) {
        List<ActivityEvent> events = activityEventRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
        List<ActivityEventDto> dtos = new ArrayList<>();
        for (ActivityEvent e : events) {
            String userName = "System User";
            if (e.getUserId() != null) {
                try {
                    Object fullName = entityManager.createNativeQuery(
                            "SELECT full_name FROM platform_users WHERE id = :userId")
                            .setParameter("userId", e.getUserId())
                            .getSingleResult();
                    if (fullName != null) {
                        userName = fullName.toString();
                    }
                } catch (Exception ex) {
                    // ignore
                }
            }
            dtos.add(ActivityEventDto.builder()
                    .id(e.getId())
                    .organizationId(e.getOrganizationId())
                    .entityType(e.getEntityType())
                    .entityId(e.getEntityId())
                    .action(e.getAction())
                    .userId(e.getUserId())
                    .userName(userName)
                    .details(e.getDetails())
                    .timestamp(e.getTimestamp())
                    .build());
        }
        return dtos;
    }
}
