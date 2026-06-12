package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.ExceptionEntryService;
import com.managemyvault.organization.web.dto.CreateExceptionRequest;
import com.managemyvault.organization.web.dto.ExceptionResponse;
import com.managemyvault.organization.web.dto.UpdateExceptionRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/docs/exceptions")
@RequiredArgsConstructor
@Validated
public class ExceptionEntryController {

    private final ExceptionEntryService exceptionEntryService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<ExceptionResponse>> getExceptions(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(exceptionEntryService.getExceptionsByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{exceptionId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<ExceptionResponse> getException(
            @PathVariable UUID organizationId,
            @PathVariable UUID exceptionId) {
        return ResponseEntity.ok(exceptionEntryService.getExceptionById(organizationId, exceptionId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<ExceptionResponse> createException(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateExceptionRequest request,
            @CurrentUser UserPrincipal currentUser) {
        ExceptionResponse response = exceptionEntryService.createException(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/docs/exceptions/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{exceptionId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<ExceptionResponse> updateException(
            @PathVariable UUID organizationId,
            @PathVariable UUID exceptionId,
            @RequestBody @Valid UpdateExceptionRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(exceptionEntryService.updateException(organizationId, exceptionId, request, currentUser));
    }

    @DeleteMapping("/{exceptionId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteException(
            @PathVariable UUID organizationId,
            @PathVariable UUID exceptionId) {
        exceptionEntryService.deleteException(organizationId, exceptionId);
        return ResponseEntity.noContent().build();
    }
}
