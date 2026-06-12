package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.NetworkMfa;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.NetworkMfaRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.CreateNetworkMfaRequest;
import com.managemyvault.organization.web.dto.NetworkMfaResponse;
import com.managemyvault.organization.web.dto.UpdateNetworkMfaRequest;
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
public class NetworkMfaService {

    private final NetworkMfaRepository networkMfaRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public Page<NetworkMfaResponse> getNetworkMfaByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<NetworkMfa> page;
        if (search != null && !search.trim().isEmpty()) {
            page = networkMfaRepository.findByOrganizationIdAndTypeAndTitleContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = networkMfaRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(NetworkMfaResponse::from);
    }

    @Transactional(readOnly = true)
    public NetworkMfaResponse getNetworkMfaById(UUID orgId, UUID entryId) {
        getOrganizationOrThrow(orgId);
        NetworkMfa entry = networkMfaRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkMfa", entryId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkMfa entry does not belong to the specified organization");
        }
        return NetworkMfaResponse.from(entry);
    }

    @Transactional
    public NetworkMfaResponse createNetworkMfa(UUID orgId, CreateNetworkMfaRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        NetworkMfa entry = NetworkMfa.builder()
                .organizationId(orgId)
                .title(request.getTitle())
                .type(request.getType())
                .param1(request.getParam1())
                .param2(request.getParam2())
                .notes(request.getNotes())
                .build();
        entry.setCreatedBy(currentUser.getId());
        NetworkMfa saved = networkMfaRepository.save(entry);
        log.info("NetworkMfa created: {} for organization {}", saved.getTitle(), orgId);
        return NetworkMfaResponse.from(saved);
    }

    @Transactional
    public NetworkMfaResponse updateNetworkMfa(UUID orgId, UUID entryId, UpdateNetworkMfaRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        NetworkMfa entry = networkMfaRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkMfa", entryId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkMfa entry does not belong to the specified organization");
        }

        if (request.getTitle() != null) entry.setTitle(request.getTitle());
        if (request.getParam1() != null) entry.setParam1(request.getParam1());
        if (request.getParam2() != null) entry.setParam2(request.getParam2());
        if (request.getNotes() != null) entry.setNotes(request.getNotes());

        entry.setUpdatedBy(currentUser.getId());
        NetworkMfa saved = networkMfaRepository.save(entry);
        log.info("NetworkMfa updated: {} for organization {}", saved.getTitle(), orgId);
        return NetworkMfaResponse.from(saved);
    }

    @Transactional
    public void deleteNetworkMfa(UUID orgId, UUID entryId) {
        getOrganizationOrThrow(orgId);
        NetworkMfa entry = networkMfaRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("NetworkMfa", entryId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("NetworkMfa entry does not belong to the specified organization");
        }
        networkMfaRepository.delete(entry);
        log.info("NetworkMfa deleted: {} from organization {}", entryId, orgId);
    }
}
