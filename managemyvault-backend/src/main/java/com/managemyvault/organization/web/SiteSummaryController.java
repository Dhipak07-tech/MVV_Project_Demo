package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.SiteSummary;
import com.managemyvault.organization.service.SiteSummaryService;
import com.managemyvault.organization.web.dto.SiteSummaryRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Validated
public class SiteSummaryController {

    private final SiteSummaryService siteSummaryService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping({"/api/v1/organizations/{organizationId}/site-summary", "/api/v1/site-summary/{organizationId}"})
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<SiteSummary> getSiteSummary(@PathVariable("organizationId") UUID organizationId) {
        try {
            return ResponseEntity.ok(siteSummaryService.getByOrganizationId(organizationId));
        } catch (Exception e) {
            // Return 404/Empty if not found yet (will be initialized in frontend)
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping({"/api/v1/site-summaries", "/api/v1/site-summary"})
    public ResponseEntity<SiteSummary> createSiteSummary(
            @RequestBody @Valid SiteSummaryRequest request,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(request.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        SiteSummary created = siteSummaryService.createSiteSummary(request, currentUser.getId());
        return ResponseEntity.created(URI.create("/api/v1/site-summary/" + created.getId())).body(created);
    }

    @PutMapping({"/api/v1/site-summaries/{id}", "/api/v1/site-summary/{id}"})
    public ResponseEntity<SiteSummary> updateSiteSummary(
            @PathVariable("id") UUID id,
            @RequestBody @Valid SiteSummaryRequest request,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummary existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.updateSiteSummary(id, request, currentUser.getId()));
    }

    @PutMapping("/api/v1/site-summary/{id}/archive")
    public ResponseEntity<SiteSummary> archiveSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummary existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.archiveSiteSummary(id, currentUser.getId()));
    }

    @DeleteMapping({"/api/v1/site-summaries/{id}", "/api/v1/site-summary/{id}"})
    public ResponseEntity<Void> deleteSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummary existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        siteSummaryService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
