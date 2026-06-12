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

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityEventService {

    private final ActivityEventRepository activityEventRepository;

    @Transactional
    public void logEvent(UUID organizationId, String entityType, UUID entityId, String action, UUID userId) {
        ActivityEvent event = ActivityEvent.builder()
                .organizationId(organizationId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .userId(userId)
                .timestamp(Instant.now())
                .build();
        activityEventRepository.save(event);
        log.debug("Logged ActivityEvent: {} for {}/{}", action, entityType, entityId);
    }

    @Transactional(readOnly = true)
    public List<ActivityEvent> getEvents(String entityType, UUID entityId) {
        return activityEventRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }
}
