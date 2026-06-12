package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.ExceptionEntry;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.ExceptionEntryRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.CreateExceptionRequest;
import com.managemyvault.organization.web.dto.ExceptionResponse;
import com.managemyvault.organization.web.dto.UpdateExceptionRequest;
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
public class ExceptionEntryService {

    private final ExceptionEntryRepository exceptionEntryRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public Page<ExceptionResponse> getExceptionsByOrgIdAndType(UUID orgId, String type, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<ExceptionEntry> page;
        if (search != null && !search.trim().isEmpty()) {
            page = exceptionEntryRepository.findByOrganizationIdAndTypeAndTitleContainingIgnoreCase(orgId, type, search, pageable);
        } else {
            page = exceptionEntryRepository.findByOrganizationIdAndType(orgId, type, pageable);
        }
        return page.map(ExceptionResponse::from);
    }

    @Transactional(readOnly = true)
    public ExceptionResponse getExceptionById(UUID orgId, UUID exceptionId) {
        getOrganizationOrThrow(orgId);
        ExceptionEntry entry = exceptionEntryRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExceptionEntry", exceptionId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("ExceptionEntry does not belong to the specified organization");
        }
        return ExceptionResponse.from(entry);
    }

    @Transactional
    public ExceptionResponse createException(UUID orgId, CreateExceptionRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        ExceptionEntry entry = ExceptionEntry.builder()
                .organizationId(orgId)
                .title(request.getTitle())
                .type(request.getType())
                .status(request.getStatus())
                .justification(request.getJustification())
                .reviewer(request.getReviewer())
                .dueDate(request.getDueDate())
                .priority(request.getPriority())
                .build();
        entry.setCreatedBy(currentUser.getId());
        ExceptionEntry saved = exceptionEntryRepository.save(entry);
        log.info("ExceptionEntry created: {} for organization {}", saved.getTitle(), orgId);
        return ExceptionResponse.from(saved);
    }

    @Transactional
    public ExceptionResponse updateException(UUID orgId, UUID exceptionId, UpdateExceptionRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        ExceptionEntry entry = exceptionEntryRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExceptionEntry", exceptionId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("ExceptionEntry does not belong to the specified organization");
        }

        if (request.getTitle() != null) entry.setTitle(request.getTitle());
        if (request.getStatus() != null) entry.setStatus(request.getStatus());
        if (request.getJustification() != null) entry.setJustification(request.getJustification());
        if (request.getReviewer() != null) entry.setReviewer(request.getReviewer());
        if (request.getDueDate() != null) entry.setDueDate(request.getDueDate());
        if (request.getPriority() != null) entry.setPriority(request.getPriority());

        entry.setUpdatedBy(currentUser.getId());
        ExceptionEntry saved = exceptionEntryRepository.save(entry);
        log.info("ExceptionEntry updated: {} for organization {}", saved.getTitle(), orgId);
        return ExceptionResponse.from(saved);
    }

    @Transactional
    public void deleteException(UUID orgId, UUID exceptionId) {
        getOrganizationOrThrow(orgId);
        ExceptionEntry entry = exceptionEntryRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException("ExceptionEntry", exceptionId.toString()));
        if (!entry.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("ExceptionEntry does not belong to the specified organization");
        }
        exceptionEntryRepository.delete(entry);
        log.info("ExceptionEntry deleted: {} from organization {}", exceptionId, orgId);
    }
}
