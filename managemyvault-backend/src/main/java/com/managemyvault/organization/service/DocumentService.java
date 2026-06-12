package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Document;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.DocumentRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.CreateDocumentRequest;
import com.managemyvault.organization.web.dto.DocumentResponse;
import com.managemyvault.organization.web.dto.UpdateDocumentRequest;
import com.managemyvault.search.domain.EntityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final OrganizationRepository organizationRepository;
    private final ApplicationEventPublisher eventPublisher;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocumentsByOrgIdAndCategory(UUID orgId, String category, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<Document> page;
        if (search != null && !search.trim().isEmpty()) {
            page = documentRepository.findByOrganizationIdAndCategoryAndTitleContainingIgnoreCase(orgId, category, search, pageable);
        } else {
            page = documentRepository.findByOrganizationIdAndCategory(orgId, category, pageable);
        }
        return page.map(DocumentResponse::from);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(UUID orgId, UUID docId) {
        getOrganizationOrThrow(orgId);
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        if (!doc.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Document does not belong to the specified organization");
        }
        return DocumentResponse.from(doc);
    }

    @Transactional
    public DocumentResponse createDocument(UUID orgId, CreateDocumentRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Document doc = Document.builder()
                .organizationId(orgId)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .build();
        doc.setCreatedBy(currentUser.getId());
        Document saved = documentRepository.save(doc);
        log.info("Document created: {} for organization {}", saved.getTitle(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.CREATE, saved.getId().toString(), "DOCUMENT", orgId.toString(), saved));
        return DocumentResponse.from(saved);
    }

    @Transactional
    public DocumentResponse updateDocument(UUID orgId, UUID docId, UpdateDocumentRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        if (!doc.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Document does not belong to the specified organization");
        }

        if (request.getTitle() != null) doc.setTitle(request.getTitle());
        if (request.getContent() != null) doc.setContent(request.getContent());
        if (request.getCategory() != null) doc.setCategory(request.getCategory());

        doc.setUpdatedBy(currentUser.getId());
        Document saved = documentRepository.save(doc);
        log.info("Document updated: {} for organization {}", saved.getTitle(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.UPDATE, saved.getId().toString(), "DOCUMENT", orgId.toString(), saved));
        return DocumentResponse.from(saved);
    }

    @Transactional
    public void deleteDocument(UUID orgId, UUID docId) {
        getOrganizationOrThrow(orgId);
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        if (!doc.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Document does not belong to the specified organization");
        }
        documentRepository.delete(doc);
        log.info("Document deleted: {} from organization {}", docId, orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.DELETE, docId.toString(), "DOCUMENT", orgId.toString(), null));
    }
}
