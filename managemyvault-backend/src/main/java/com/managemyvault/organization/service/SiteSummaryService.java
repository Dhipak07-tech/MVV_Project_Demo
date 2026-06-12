package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.SiteSummary;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.repository.SiteSummaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteSummaryService {

    private final SiteSummaryRepository siteSummaryRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    private void validateOrganization(UUID orgId) {
        organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public SiteSummary getByOrganizationId(UUID organizationId) {
        validateOrganization(organizationId);
        return siteSummaryRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", "Org ID: " + organizationId));
    }

    @Transactional(readOnly = true)
    public SiteSummary getById(UUID id) {
        return siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));
    }

    @Transactional
    public SiteSummary create(SiteSummary siteSummary, UUID userId) {
        validateOrganization(siteSummary.getOrganizationId());
        
        // Ensure only one SiteSummary per Organization
        siteSummaryRepository.findByOrganizationId(siteSummary.getOrganizationId()).ifPresent(s -> {
            throw new IllegalStateException("SiteSummary already exists for organization: " + siteSummary.getOrganizationId());
        });

        siteSummary.setCreatedBy(userId);
        if (siteSummary.getActive() == null) {
            siteSummary.setActive(true);
        }
        SiteSummary saved = siteSummaryRepository.save(siteSummary);

        activityEventService.logEvent(saved.getOrganizationId(), "SiteSummary", saved.getId(), "CREATE", userId);
        revisionService.saveRevision("SiteSummary", saved.getId(), null, saved, userId);

        return saved;
    }

    @Transactional
    public SiteSummary update(UUID id, SiteSummary updateData, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        // Clone/Backup before state for revision history
        SiteSummary beforeState = SiteSummary.builder()
                .id(existing.getId())
                .organizationId(existing.getOrganizationId())
                .title(existing.getTitle())
                .timezone(existing.getTimezone())
                .businessHours(existing.getBusinessHours())
                .notes(existing.getNotes())
                .primaryContactId(existing.getPrimaryContactId())
                .emergencyContactId(existing.getEmergencyContactId())
                .authorizationContactId(existing.getAuthorizationContactId())
                .active(existing.getActive())
                .build();
        beforeState.setCreatedAt(existing.getCreatedAt());
        beforeState.setCreatedBy(existing.getCreatedBy());
        beforeState.setUpdatedAt(existing.getUpdatedAt());
        beforeState.setUpdatedBy(existing.getUpdatedBy());

        if (updateData.getTitle() != null) existing.setTitle(updateData.getTitle());
        if (updateData.getTimezone() != null) existing.setTimezone(updateData.getTimezone());
        if (updateData.getBusinessHours() != null) existing.setBusinessHours(updateData.getBusinessHours());
        if (updateData.getNotes() != null) existing.setNotes(updateData.getNotes());
        existing.setPrimaryContactId(updateData.getPrimaryContactId());
        existing.setEmergencyContactId(updateData.getEmergencyContactId());
        existing.setAuthorizationContactId(updateData.getAuthorizationContactId());
        if (updateData.getActive() != null) existing.setActive(updateData.getActive());

        existing.setUpdatedBy(userId);
        SiteSummary saved = siteSummaryRepository.save(existing);

        activityEventService.logEvent(saved.getOrganizationId(), "SiteSummary", saved.getId(), "UPDATE", userId);
        revisionService.saveRevision("SiteSummary", saved.getId(), beforeState, saved, userId);

        return saved;
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        siteSummaryRepository.delete(existing);
        activityEventService.logEvent(existing.getOrganizationId(), "SiteSummary", existing.getId(), "DELETE", userId);
    }
}
