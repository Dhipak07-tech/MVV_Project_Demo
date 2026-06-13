package com.managemyvault.organization.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Contact;
import com.managemyvault.organization.domain.SiteSummary;
import com.managemyvault.organization.domain.SiteSummaryRevision;
import com.managemyvault.organization.repository.ContactRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.repository.SiteSummaryRepository;
import com.managemyvault.organization.repository.SiteSummaryRevisionRepository;
import com.managemyvault.organization.web.dto.SiteSummaryRequest;
import com.managemyvault.organization.web.dto.SiteSummaryResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteSummaryService {

    private final SiteSummaryRepository siteSummaryRepository;
    private final SiteSummaryRevisionRepository siteSummaryRevisionRepository;
    private final OrganizationRepository organizationRepository;
    private final ContactRepository contactRepository;
    private final ActivityEventService activityEventService;
    private final RelationshipService relationshipService;
    private final AttachmentService attachmentService;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Getter
    @Builder
    public static class SiteSummaryRevisionDto {
        private UUID id;
        private UUID siteSummaryId;
        private String beforeState;
        private String afterState;
        private UUID changedBy;
        private String changedByName;
        private LocalDateTime changedAt;
    }

    private void validateOrganization(UUID orgId) {
        organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    private void validateContactOrg(UUID contactId, UUID expectedOrgId) {
        if (contactId != null) {
            Contact contact = contactRepository.findById(contactId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", contactId.toString()));
            if (!contact.getOrganization().getId().equals(expectedOrgId)) {
                throw new IllegalArgumentException("Contact " + contactId + " does not belong to organization " + expectedOrgId);
            }
        }
    }

    private void validateContacts(SiteSummaryRequest request, UUID orgId) {
        validateContactOrg(request.getPrimaryContactId(), orgId);
        validateContactOrg(request.getEmergencyContact1Id(), orgId);
        validateContactOrg(request.getEmergencyContact2Id(), orgId);
        validateContactOrg(request.getAuthorizationContactId(), orgId);
    }

    private long countRelationships(UUID siteId, String targetType) {
        String sql = "SELECT COUNT(r) FROM Relationship r WHERE " +
                     "((r.sourceType = 'SITE_SUMMARY' AND r.sourceId = :siteId AND r.targetType = :targetType) OR " +
                     " (r.targetType = 'SITE_SUMMARY' AND r.targetId = :siteId AND r.sourceType = :targetType))";
        return entityManager.createQuery(sql, Long.class)
                .setParameter("siteId", siteId)
                .setParameter("targetType", targetType)
                .getSingleResult();
    }

    private String getContactName(UUID contactId) {
        if (contactId == null) return null;
        return contactRepository.findById(contactId)
                .map(Contact::getName)
                .orElse(null);
    }

    private String resolveUserName(UUID userId) {
        if (userId == null) return "System";
        try {
            Object fullName = entityManager.createNativeQuery(
                    "SELECT full_name FROM platform_users WHERE id = :userId UNION ALL SELECT full_name FROM organization_members WHERE id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
            if (fullName != null) {
                return fullName.toString();
            }
        } catch (Exception e) {
            // ignore
        }
        return "Unknown User";
    }

    private SiteSummary cloneState(SiteSummary s) {
        return SiteSummary.builder()
                .id(s.getId())
                .organizationId(s.getOrganizationId())
                .title(s.getTitle())
                .timezone(s.getTimezone())
                .hoursOfOperation(s.getHoursOfOperation())
                .notes(s.getNotes())
                .primaryContactId(s.getPrimaryContactId())
                .emergencyContact1Id(s.getEmergencyContact1Id())
                .emergencyContact2Id(s.getEmergencyContact2Id())
                .authorizationContactId(s.getAuthorizationContactId())
                .isArchived(s.getIsArchived())
                .archivedAt(s.getArchivedAt())
                .archivedBy(s.getArchivedBy())
                .build();
    }

    private void saveRevisionLog(UUID siteId, SiteSummary before, SiteSummary after, UUID userId) {
        try {
            String beforeJson = before != null ? objectMapper.writeValueAsString(before) : null;
            String afterJson = after != null ? objectMapper.writeValueAsString(after) : null;

            SiteSummaryRevision revision = SiteSummaryRevision.builder()
                    .siteSummaryId(siteId)
                    .beforeState(beforeJson)
                    .afterState(afterJson)
                    .changedBy(userId)
                    .changedAt(LocalDateTime.now())
                    .build();

            siteSummaryRevisionRepository.save(revision);
        } catch (Exception e) {
            log.error("Failed to save site summary revision for ID {}: {}", siteId, e.getMessage(), e);
        }
    }

    public SiteSummaryResponse toResponse(SiteSummary s) {
        if (s == null) return null;
        return SiteSummaryResponse.builder()
                .id(s.getId())
                .organizationId(s.getOrganizationId())
                .title(s.getTitle())
                .timezone(s.getTimezone())
                .hoursOfOperation(s.getHoursOfOperation())
                .notes(s.getNotes())
                .primaryContactId(s.getPrimaryContactId())
                .primaryContactName(getContactName(s.getPrimaryContactId()))
                .emergencyContact1Id(s.getEmergencyContact1Id())
                .emergencyContact1Name(getContactName(s.getEmergencyContact1Id()))
                .emergencyContact2Id(s.getEmergencyContact2Id())
                .emergencyContact2Name(getContactName(s.getEmergencyContact2Id()))
                .authorizationContactId(s.getAuthorizationContactId())
                .authorizationContactName(getContactName(s.getAuthorizationContactId()))
                .isArchived(s.getIsArchived())
                .archivedAt(s.getArchivedAt())
                .archivedBy(s.getArchivedBy())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .createdBy(s.getCreatedBy())
                .updatedBy(s.getUpdatedBy())
                .locationCount(countRelationships(s.getId(), "LOCATION"))
                .passwordCount(countRelationships(s.getId(), "PASSWORD"))
                .documentCount(countRelationships(s.getId(), "DOCUMENT"))
                .assetCount(countRelationships(s.getId(), "ASSET"))
                .build();
    }

    @Transactional(readOnly = true)
    public Page<SiteSummaryResponse> listSites(UUID orgId, Boolean isArchived, String search, Pageable pageable) {
        validateOrganization(orgId);
        Page<SiteSummary> page = siteSummaryRepository.searchSites(orgId, isArchived, search, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public SiteSummaryResponse getById(UUID id) {
        SiteSummary site = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));
        return toResponse(site);
    }

    @Transactional
    public SiteSummaryResponse createSiteSummary(SiteSummaryRequest request, UUID userId) {
        validateOrganization(request.getOrganizationId());
        validateContacts(request, request.getOrganizationId());

        SiteSummary siteSummary = SiteSummary.builder()
                .organizationId(request.getOrganizationId())
                .title(request.getTitle())
                .timezone(request.getTimezone())
                .hoursOfOperation(request.getHoursOfOperation())
                .notes(request.getNotes())
                .primaryContactId(request.getPrimaryContactId())
                .emergencyContact1Id(request.getEmergencyContact1Id())
                .emergencyContact2Id(request.getEmergencyContact2Id())
                .authorizationContactId(request.getAuthorizationContactId())
                .isArchived(false)
                .build();

        siteSummary.setCreatedBy(userId);
        SiteSummary saved = siteSummaryRepository.save(siteSummary);

        activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_CREATED", userId, "Created Site: " + saved.getTitle());
        saveRevisionLog(saved.getId(), null, saved, userId);

        return toResponse(saved);
    }

    @Transactional
    public SiteSummaryResponse updateSiteSummary(UUID id, SiteSummaryRequest request, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        validateContacts(request, existing.getOrganizationId());

        SiteSummary beforeState = cloneState(existing);

        existing.setTitle(request.getTitle());
        existing.setTimezone(request.getTimezone());
        existing.setHoursOfOperation(request.getHoursOfOperation());
        existing.setNotes(request.getNotes());
        existing.setPrimaryContactId(request.getPrimaryContactId());
        existing.setEmergencyContact1Id(request.getEmergencyContact1Id());
        existing.setEmergencyContact2Id(request.getEmergencyContact2Id());
        existing.setAuthorizationContactId(request.getAuthorizationContactId());
        existing.setUpdatedBy(userId);

        SiteSummary saved = siteSummaryRepository.save(existing);

        activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_UPDATED", userId, "Updated Site: " + saved.getTitle());
        saveRevisionLog(saved.getId(), beforeState, saved, userId);

        return toResponse(saved);
    }

    @Transactional
    public SiteSummaryResponse archiveSiteSummary(UUID id, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        SiteSummary beforeState = cloneState(existing);

        existing.setIsArchived(true);
        existing.setArchivedAt(LocalDateTime.now());
        existing.setArchivedBy(userId);
        existing.setUpdatedBy(userId);

        SiteSummary saved = siteSummaryRepository.save(existing);

        activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_ARCHIVED", userId, "Archived Site: " + saved.getTitle());
        saveRevisionLog(saved.getId(), beforeState, saved, userId);

        return toResponse(saved);
    }

    @Transactional
    public SiteSummaryResponse restoreSiteSummary(UUID id, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        SiteSummary beforeState = cloneState(existing);

        existing.setIsArchived(false);
        existing.setArchivedAt(null);
        existing.setArchivedBy(null);
        existing.setUpdatedBy(userId);

        SiteSummary saved = siteSummaryRepository.save(existing);

        activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_RESTORED", userId, "Restored Site: " + saved.getTitle());
        saveRevisionLog(saved.getId(), beforeState, saved, userId);

        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        siteSummaryRepository.delete(existing);
        activityEventService.logEvent(existing.getOrganizationId(), "SITE_SUMMARY", existing.getId(), "DELETE", userId, "Deleted Site: " + existing.getTitle());
    }

    @Transactional
    public SiteSummaryResponse cloneSite(UUID id, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", id.toString()));

        SiteSummary cloned = SiteSummary.builder()
                .organizationId(existing.getOrganizationId())
                .title(existing.getTitle() + " - Copy")
                .timezone(existing.getTimezone())
                .hoursOfOperation(existing.getHoursOfOperation())
                .notes(existing.getNotes())
                .primaryContactId(existing.getPrimaryContactId())
                .emergencyContact1Id(existing.getEmergencyContact1Id())
                .emergencyContact2Id(existing.getEmergencyContact2Id())
                .authorizationContactId(existing.getAuthorizationContactId())
                .isArchived(false)
                .build();

        cloned.setCreatedBy(userId);
        SiteSummary saved = siteSummaryRepository.save(cloned);

        activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_CREATED", userId, "Cloned Site: " + saved.getTitle());
        saveRevisionLog(saved.getId(), null, saved, userId);

        // Copy Relationships
        List<RelationshipService.RelationshipDto> relationships = relationshipService.getRelationshipsForEntity("SITE_SUMMARY", existing.getId());
        for (RelationshipService.RelationshipDto rel : relationships) {
            relationshipService.link(
                    saved.getOrganizationId(),
                    "SITE_SUMMARY",
                    saved.getId(),
                    rel.getRelatedEntityType(),
                    rel.getRelatedEntityId(),
                    userId
            );
        }

        // Copy Attachments
        attachmentService.copyAttachments("SITE_SUMMARY", existing.getId(), saved.getId(), userId);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SiteSummaryRevisionDto> getRevisions(UUID siteId) {
        List<SiteSummaryRevision> revisions = siteSummaryRevisionRepository.findBySiteSummaryIdOrderByChangedAtDesc(siteId);
        List<SiteSummaryRevisionDto> dtos = new ArrayList<>();
        for (SiteSummaryRevision r : revisions) {
            String userName = resolveUserName(r.getChangedBy());
            dtos.add(SiteSummaryRevisionDto.builder()
                    .id(r.getId())
                    .siteSummaryId(r.getSiteSummaryId())
                    .beforeState(r.getBeforeState())
                    .afterState(r.getAfterState())
                    .changedBy(r.getChangedBy())
                    .changedByName(userName)
                    .changedAt(r.getChangedAt())
                    .build());
        }
        return dtos;
    }

    @Transactional
    public SiteSummaryResponse restoreRevision(UUID siteId, UUID revisionId, UUID userId) {
        SiteSummary existing = siteSummaryRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummary", siteId.toString()));
        SiteSummaryRevision revision = siteSummaryRevisionRepository.findById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException("SiteSummaryRevision", revisionId.toString()));

        if (!revision.getSiteSummaryId().equals(siteId)) {
            throw new IllegalArgumentException("Revision " + revisionId + " does not belong to Site " + siteId);
        }

        SiteSummary beforeState = cloneState(existing);

        try {
            SiteSummary stateToRestore = objectMapper.readValue(revision.getAfterState(), SiteSummary.class);

            existing.setTitle(stateToRestore.getTitle());
            existing.setTimezone(stateToRestore.getTimezone());
            existing.setHoursOfOperation(stateToRestore.getHoursOfOperation());
            existing.setNotes(stateToRestore.getNotes());
            existing.setPrimaryContactId(stateToRestore.getPrimaryContactId());
            existing.setEmergencyContact1Id(stateToRestore.getEmergencyContact1Id());
            existing.setEmergencyContact2Id(stateToRestore.getEmergencyContact2Id());
            existing.setAuthorizationContactId(stateToRestore.getAuthorizationContactId());
            existing.setUpdatedBy(userId);

            SiteSummary saved = siteSummaryRepository.save(existing);
            activityEventService.logEvent(saved.getOrganizationId(), "SITE_SUMMARY", saved.getId(), "SITE_UPDATED", userId, "Restored revision of Site: " + saved.getTitle());
            saveRevisionLog(saved.getId(), beforeState, saved, userId);

            return toResponse(saved);
        } catch (Exception e) {
            log.error("Failed to restore revision {}: {}", revisionId, e.getMessage(), e);
            throw new RuntimeException("Failed to restore revision: " + e.getMessage(), e);
        }
    }
}
