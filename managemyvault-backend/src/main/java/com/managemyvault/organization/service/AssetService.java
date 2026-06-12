package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Asset;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.AssetRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.AssetResponse;
import com.managemyvault.organization.web.dto.CreateAssetRequest;
import com.managemyvault.organization.web.dto.UpdateAssetRequest;
import com.managemyvault.search.domain.EntityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
public class AssetService {

    private final AssetRepository assetRepository;
    private final OrganizationRepository organizationRepository;
    private final ApplicationEventPublisher eventPublisher;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getAssetsByOrgId(UUID orgId) {
        getOrganizationOrThrow(orgId);
        return assetRepository.findByOrganizationId(orgId).stream()
                .map(AssetResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AssetResponse> getAssetsByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<Asset> page;
        if (search != null && !search.trim().isEmpty()) {
            page = assetRepository.findByOrganizationIdAndTypeAndNameContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = assetRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(AssetResponse::from);
    }

    @Transactional(readOnly = true)
    public AssetResponse getAssetById(UUID orgId, UUID assetId) {
        getOrganizationOrThrow(orgId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Asset does not belong to the specified organization");
        }
        return AssetResponse.from(asset);
    }

    @Transactional
    public AssetResponse createAsset(UUID orgId, CreateAssetRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Asset asset = Asset.builder()
                .organizationId(orgId)
                .name(request.getName())
                .type(request.getType())
                .ipAddress(request.getIpAddress())
                .macAddress(request.getMacAddress())
                .serialNumber(request.getSerialNumber())
                .model(request.getModel())
                .manufacturer(request.getManufacturer())
                .osVersion(request.getOsVersion())
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();
        asset.setCreatedBy(currentUser.getId());
        Asset saved = assetRepository.save(asset);
        log.info("Asset created: {} for organization {}", saved.getName(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.CREATE, saved.getId().toString(), "ASSET", orgId.toString(), saved));
        return AssetResponse.from(saved);
    }

    @Transactional
    public AssetResponse updateAsset(UUID orgId, UUID assetId, UpdateAssetRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Asset does not belong to the specified organization");
        }

        if (request.getName() != null) asset.setName(request.getName());
        if (request.getIpAddress() != null) asset.setIpAddress(request.getIpAddress());
        if (request.getMacAddress() != null) asset.setMacAddress(request.getMacAddress());
        if (request.getSerialNumber() != null) asset.setSerialNumber(request.getSerialNumber());
        if (request.getModel() != null) asset.setModel(request.getModel());
        if (request.getManufacturer() != null) asset.setManufacturer(request.getManufacturer());
        if (request.getOsVersion() != null) asset.setOsVersion(request.getOsVersion());
        if (request.getStatus() != null) asset.setStatus(request.getStatus());
        if (request.getNotes() != null) asset.setNotes(request.getNotes());

        asset.setUpdatedBy(currentUser.getId());
        Asset saved = assetRepository.save(asset);
        log.info("Asset updated: {} for organization {}", saved.getName(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.UPDATE, saved.getId().toString(), "ASSET", orgId.toString(), saved));
        return AssetResponse.from(saved);
    }

    @Transactional
    public void deleteAsset(UUID orgId, UUID assetId) {
        getOrganizationOrThrow(orgId);
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Asset does not belong to the specified organization");
        }
        assetRepository.delete(asset);
        log.info("Asset deleted: {} from organization {}", assetId, orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.DELETE, assetId.toString(), "ASSET", orgId.toString(), null));
    }
}
