package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.AppService;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.AppServiceRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.AppResponse;
import com.managemyvault.organization.web.dto.CreateAppRequest;
import com.managemyvault.organization.web.dto.UpdateAppRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppServiceService {

    private final AppServiceRepository appServiceRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public List<AppResponse> getAppsByOrgId(UUID orgId) {
        getOrganizationOrThrow(orgId);
        return appServiceRepository.findByOrganizationId(orgId).stream()
                .map(AppResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppResponse> getAppsByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<AppService> page;
        if (search != null && !search.trim().isEmpty()) {
            page = appServiceRepository.findByOrganizationIdAndTypeAndNameContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = appServiceRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(AppResponse::from);
    }

    @Transactional(readOnly = true)
    public AppResponse getAppById(UUID orgId, UUID appId) {
        getOrganizationOrThrow(orgId);
        AppService app = appServiceRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("AppService", appId.toString()));
        if (!app.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("AppService does not belong to the specified organization");
        }
        return AppResponse.from(app);
    }

    @Transactional
    public AppResponse createApp(UUID orgId, CreateAppRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        AppService app = AppService.builder()
                .organizationId(orgId)
                .name(request.getName())
                .type(request.getType())
                .provider(request.getProvider())
                .licenseKey(request.getLicenseKey())
                .url(request.getUrl())
                .notes(request.getNotes())
                .build();
        app.setCreatedBy(currentUser.getId());
        AppService saved = appServiceRepository.save(app);
        log.info("AppService created: {} for organization {}", saved.getName(), orgId);
        return AppResponse.from(saved);
    }

    @Transactional
    public AppResponse updateApp(UUID orgId, UUID appId, UpdateAppRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        AppService app = appServiceRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("AppService", appId.toString()));
        if (!app.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("AppService does not belong to the specified organization");
        }

        if (request.getName() != null) app.setName(request.getName());
        if (request.getProvider() != null) app.setProvider(request.getProvider());
        if (request.getLicenseKey() != null) app.setLicenseKey(request.getLicenseKey());
        if (request.getUrl() != null) app.setUrl(request.getUrl());
        if (request.getNotes() != null) app.setNotes(request.getNotes());

        app.setUpdatedBy(currentUser.getId());
        AppService saved = appServiceRepository.save(app);
        log.info("AppService updated: {} for organization {}", saved.getName(), orgId);
        return AppResponse.from(saved);
    }

    @Transactional
    public void deleteApp(UUID orgId, UUID appId) {
        getOrganizationOrThrow(orgId);
        AppService app = appServiceRepository.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("AppService", appId.toString()));
        if (!app.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("AppService does not belong to the specified organization");
        }
        appServiceRepository.delete(app);
        log.info("AppService deleted: {} from organization {}", appId, orgId);
    }
}
