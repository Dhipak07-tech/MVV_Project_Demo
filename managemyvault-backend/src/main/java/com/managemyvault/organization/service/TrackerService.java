package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.Tracker;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.repository.TrackerRepository;
import com.managemyvault.organization.web.dto.CreateTrackerRequest;
import com.managemyvault.organization.web.dto.TrackerResponse;
import com.managemyvault.organization.web.dto.UpdateTrackerRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackerService {

    private final TrackerRepository trackerRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public Page<TrackerResponse> getTrackersByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<Tracker> page;
        if (search != null && !search.trim().isEmpty()) {
            page = trackerRepository.findByOrganizationIdAndTypeAndNameContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = trackerRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(TrackerResponse::from);
    }

    @Transactional(readOnly = true)
    public TrackerResponse getTrackerById(UUID orgId, UUID trackerId) {
        getOrganizationOrThrow(orgId);
        Tracker tracker = trackerRepository.findById(trackerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracker", trackerId.toString()));
        if (!tracker.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Tracker does not belong to the specified organization");
        }
        return TrackerResponse.from(tracker);
    }

    @Transactional
    public TrackerResponse createTracker(UUID orgId, CreateTrackerRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Tracker tracker = Tracker.builder()
                .organizationId(orgId)
                .name(request.getName())
                .type(request.getType())
                .registrarOrIssuer(request.getRegistrarOrIssuer())
                .expiryDate(request.getExpiryDate())
                .autoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : true)
                .dnsOrStrength(request.getDnsOrStrength())
                .build();
        tracker.setCreatedBy(currentUser.getId());
        Tracker saved = trackerRepository.save(tracker);
        log.info("Tracker created: {} for organization {}", saved.getName(), orgId);
        return TrackerResponse.from(saved);
    }

    @Transactional
    public TrackerResponse updateTracker(UUID orgId, UUID trackerId, UpdateTrackerRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Tracker tracker = trackerRepository.findById(trackerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracker", trackerId.toString()));
        if (!tracker.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Tracker does not belong to the specified organization");
        }

        if (request.getName() != null) tracker.setName(request.getName());
        if (request.getRegistrarOrIssuer() != null) tracker.setRegistrarOrIssuer(request.getRegistrarOrIssuer());
        if (request.getExpiryDate() != null) tracker.setExpiryDate(request.getExpiryDate());
        if (request.getAutoRenew() != null) tracker.setAutoRenew(request.getAutoRenew());
        if (request.getDnsOrStrength() != null) tracker.setDnsOrStrength(request.getDnsOrStrength());

        tracker.setUpdatedBy(currentUser.getId());
        Tracker saved = trackerRepository.save(tracker);
        log.info("Tracker updated: {} for organization {}", saved.getName(), orgId);
        return TrackerResponse.from(saved);
    }

    @Transactional
    public void deleteTracker(UUID orgId, UUID trackerId) {
        getOrganizationOrThrow(orgId);
        Tracker tracker = trackerRepository.findById(trackerId)
                .orElseThrow(() -> new ResourceNotFoundException("Tracker", trackerId.toString()));
        if (!tracker.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Tracker does not belong to the specified organization");
        }
        trackerRepository.delete(tracker);
        log.info("Tracker deleted: {} from organization {}", trackerId, orgId);
    }
}
