package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.BackupSolution;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.BackupSolutionRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.BackupResponse;
import com.managemyvault.organization.web.dto.CreateBackupRequest;
import com.managemyvault.organization.web.dto.UpdateBackupRequest;
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
public class BackupSolutionService {

    private final BackupSolutionRepository backupSolutionRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public List<BackupResponse> getBackupsByOrgId(UUID orgId) {
        getOrganizationOrThrow(orgId);
        return backupSolutionRepository.findByOrganizationId(orgId).stream()
                .map(BackupResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<BackupResponse> getBackupsByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<BackupSolution> page;
        if (search != null && !search.trim().isEmpty()) {
            page = backupSolutionRepository.findByOrganizationIdAndTypeAndNameContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = backupSolutionRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(BackupResponse::from);
    }

    @Transactional(readOnly = true)
    public BackupResponse getBackupById(UUID orgId, UUID backupId) {
        getOrganizationOrThrow(orgId);
        BackupSolution backup = backupSolutionRepository.findById(backupId)
                .orElseThrow(() -> new ResourceNotFoundException("BackupSolution", backupId.toString()));
        if (!backup.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("BackupSolution does not belong to the specified organization");
        }
        return BackupResponse.from(backup);
    }

    @Transactional
    public BackupResponse createBackup(UUID orgId, CreateBackupRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        BackupSolution backup = BackupSolution.builder()
                .organizationId(orgId)
                .name(request.getName())
                .type(request.getType())
                .destination(request.getDestination())
                .frequency(request.getFrequency())
                .retentionPolicy(request.getRetentionPolicy())
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();
        backup.setCreatedBy(currentUser.getId());
        BackupSolution saved = backupSolutionRepository.save(backup);
        log.info("BackupSolution created: {} for organization {}", saved.getName(), orgId);
        return BackupResponse.from(saved);
    }

    @Transactional
    public BackupResponse updateBackup(UUID orgId, UUID backupId, UpdateBackupRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        BackupSolution backup = backupSolutionRepository.findById(backupId)
                .orElseThrow(() -> new ResourceNotFoundException("BackupSolution", backupId.toString()));
        if (!backup.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("BackupSolution does not belong to the specified organization");
        }

        if (request.getName() != null) backup.setName(request.getName());
        if (request.getDestination() != null) backup.setDestination(request.getDestination());
        if (request.getFrequency() != null) backup.setFrequency(request.getFrequency());
        if (request.getRetentionPolicy() != null) backup.setRetentionPolicy(request.getRetentionPolicy());
        if (request.getStatus() != null) backup.setStatus(request.getStatus());
        if (request.getNotes() != null) backup.setNotes(request.getNotes());

        backup.setUpdatedBy(currentUser.getId());
        BackupSolution saved = backupSolutionRepository.save(backup);
        log.info("BackupSolution updated: {} for organization {}", saved.getName(), orgId);
        return BackupResponse.from(saved);
    }

    @Transactional
    public void deleteBackup(UUID orgId, UUID backupId) {
        getOrganizationOrThrow(orgId);
        BackupSolution backup = backupSolutionRepository.findById(backupId)
                .orElseThrow(() -> new ResourceNotFoundException("BackupSolution", backupId.toString()));
        if (!backup.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("BackupSolution does not belong to the specified organization");
        }
        backupSolutionRepository.delete(backup);
        log.info("BackupSolution deleted: {} from organization {}", backupId, orgId);
    }
}
