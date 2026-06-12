package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.LegacySiteSummary;
import com.managemyvault.organization.repository.LegacySiteSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LegacySiteSummaryService {

    private final LegacySiteSummaryRepository repository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    @Transactional(readOnly = true)
    public List<LegacySiteSummary> getByOrganizationId(UUID organizationId) {
        return repository.findByOrganizationId(organizationId);
    }

    @Transactional(readOnly = true)
    public LegacySiteSummary getById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LegacySiteSummary", id.toString()));
    }

    @Transactional
    public LegacySiteSummary create(LegacySiteSummary summary, UUID userId) {
        summary.setCreatedBy(userId);
        if (summary.getArchived() == null) {
            summary.setArchived(false);
        }
        LegacySiteSummary saved = repository.save(summary);

        activityEventService.logEvent(saved.getOrganizationId(), "LegacySiteSummary", saved.getId(), "CREATE", userId);
        revisionService.saveRevision("LegacySiteSummary", saved.getId(), null, saved, userId);

        return saved;
    }

    @Transactional
    public LegacySiteSummary update(UUID id, LegacySiteSummary updated, UUID userId) {
        LegacySiteSummary existing = getById(id);
        
        // Clone for revision tracking
        LegacySiteSummary before = LegacySiteSummary.builder()
                .id(existing.getId())
                .organizationId(existing.getOrganizationId())
                .title(existing.getTitle())
                .content(existing.getContent())
                .archived(existing.getArchived())
                .build();
        before.setVersion(existing.getVersion());

        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setArchived(updated.getArchived());
        existing.setUpdatedBy(userId);

        LegacySiteSummary saved = repository.save(existing);

        activityEventService.logEvent(saved.getOrganizationId(), "LegacySiteSummary", saved.getId(), "UPDATE", userId);
        revisionService.saveRevision("LegacySiteSummary", saved.getId(), before, saved, userId);

        return saved;
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        LegacySiteSummary existing = getById(id);
        
        // Save revision
        revisionService.saveRevision("LegacySiteSummary", existing.getId(), existing, null, userId);
        activityEventService.logEvent(existing.getOrganizationId(), "LegacySiteSummary", existing.getId(), "DELETE", userId);

        repository.delete(existing);
    }
}
