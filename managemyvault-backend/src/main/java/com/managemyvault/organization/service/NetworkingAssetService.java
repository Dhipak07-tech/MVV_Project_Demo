package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.NetworkingAsset;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.NetworkingAssetRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.CreateNetworkingAssetRequest;
import com.managemyvault.organization.web.dto.NetworkingAssetResponse;
import com.managemyvault.organization.web.dto.UpdateNetworkingAssetRequest;
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
public class NetworkingAssetService {

    private final NetworkingAssetRepository networkingAssetRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public List<NetworkingAssetResponse> getNetworkingAssetsByOrgId(UUID orgId) {
        getOrganizationOrThrow(orgId);
        return networkingAssetRepository.findByOrganizationId(orgId).stream()
                .map(NetworkingAssetResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NetworkingAssetResponse> getNetworkingAssetsByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<NetworkingAsset> page;
        if (search != null && !search.trim().isEmpty()) {
            page = networkingAssetRepository.findByOrganizationIdAndTypeAndNameContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = networkingAssetRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(NetworkingAssetResponse::from);
    }

    @Transactional(readOnly = true)
    public NetworkingAssetResponse getNetworkingAssetById(UUID orgId, UUID assetId) {
        getOrganizationOrThrow(orgId);
        NetworkingAsset asset = networkingAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkingAsset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkingAsset does not belong to the specified organization");
        }
        return NetworkingAssetResponse.from(asset);
    }

    @Transactional
    public NetworkingAssetResponse createNetworkingAsset(UUID orgId, CreateNetworkingAssetRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        NetworkingAsset asset = NetworkingAsset.builder()
                .organizationId(orgId)
                .name(request.getName())
                .type(request.getType())
                .subnetCidr(request.getSubnetCidr())
                .gateway(request.getGateway())
                .vlanId(request.getVlanId())
                .details(request.getDetails())
                .build();
        asset.setCreatedBy(currentUser.getId());
        NetworkingAsset saved = networkingAssetRepository.save(asset);
        log.info("NetworkingAsset created: {} for organization {}", saved.getName(), orgId);
        return NetworkingAssetResponse.from(saved);
    }

    @Transactional
    public NetworkingAssetResponse updateNetworkingAsset(UUID orgId, UUID assetId, UpdateNetworkingAssetRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        NetworkingAsset asset = networkingAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkingAsset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkingAsset does not belong to the specified organization");
        }

        if (request.getName() != null) asset.setName(request.getName());
        if (request.getSubnetCidr() != null) asset.setSubnetCidr(request.getSubnetCidr());
        if (request.getGateway() != null) asset.setGateway(request.getGateway());
        if (request.getVlanId() != null) asset.setVlanId(request.getVlanId());
        if (request.getDetails() != null) asset.setDetails(request.getDetails());

        asset.setUpdatedBy(currentUser.getId());
        NetworkingAsset saved = networkingAssetRepository.save(asset);
        log.info("NetworkingAsset updated: {} for organization {}", saved.getName(), orgId);
        return NetworkingAssetResponse.from(saved);
    }

    @Transactional
    public void deleteNetworkingAsset(UUID orgId, UUID assetId) {
        getOrganizationOrThrow(orgId);
        NetworkingAsset asset = networkingAssetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkingAsset", assetId.toString()));
        if (!asset.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkingAsset does not belong to the specified organization");
        }
        networkingAssetRepository.delete(asset);
        log.info("NetworkingAsset deleted: {} from organization {}", assetId, orgId);
    }
}
