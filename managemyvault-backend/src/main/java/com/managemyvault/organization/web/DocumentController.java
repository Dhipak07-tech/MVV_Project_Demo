package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.DocumentService;
import com.managemyvault.organization.web.dto.CreateDocumentRequest;
import com.managemyvault.organization.web.dto.DocumentResponse;
import com.managemyvault.organization.web.dto.UpdateDocumentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/org/{organizationId}/docs/documents")
@RequiredArgsConstructor
@Validated
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<DocumentResponse>> getDocuments(
            @PathVariable UUID organizationId,
            @RequestParam String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(documentService.getDocumentsByOrgIdAndCategory(organizationId, category, search, pageable));
    }

    @GetMapping("/{docId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<DocumentResponse> getDocument(
            @PathVariable UUID organizationId,
            @PathVariable UUID docId) {
        return ResponseEntity.ok(documentService.getDocumentById(organizationId, docId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<DocumentResponse> createDocument(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateDocumentRequest request,
            @CurrentUser UserPrincipal currentUser) {
        DocumentResponse response = documentService.createDocument(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/docs/documents/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{docId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable UUID organizationId,
            @PathVariable UUID docId,
            @RequestBody @Valid UpdateDocumentRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.updateDocument(organizationId, docId, request, currentUser));
    }

    @DeleteMapping("/{docId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable UUID organizationId,
            @PathVariable UUID docId) {
        documentService.deleteDocument(organizationId, docId);
        return ResponseEntity.noContent().build();
    }
}
