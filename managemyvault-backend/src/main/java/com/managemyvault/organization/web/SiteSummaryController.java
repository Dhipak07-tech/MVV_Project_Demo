package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.SiteSummaryService;
import com.managemyvault.organization.service.SiteSummaryService.SiteSummaryRevisionDto;
import com.managemyvault.organization.web.dto.SiteSummaryRequest;
import com.managemyvault.organization.web.dto.SiteSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sites")
@RequiredArgsConstructor
@Validated
public class SiteSummaryController {

    private final SiteSummaryService siteSummaryService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<Page<SiteSummaryResponse>> listSites(
            @RequestParam("organizationId") UUID organizationId,
            @RequestParam(value = "isArchived", required = false, defaultValue = "false") Boolean isArchived,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "title") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc") String sortDir) {
        
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(siteSummaryService.listSites(organizationId, isArchived, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteSummaryResponse> getSiteSummary(@PathVariable("id") UUID id) {
        SiteSummaryResponse site = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(site.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(site);
    }

    @PostMapping
    public ResponseEntity<SiteSummaryResponse> createSiteSummary(
            @RequestBody @Valid SiteSummaryRequest request,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(request.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(siteSummaryService.createSiteSummary(request, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteSummaryResponse> updateSiteSummary(
            @PathVariable("id") UUID id,
            @RequestBody @Valid SiteSummaryRequest request,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.updateSiteSummary(id, request, currentUser.getId()));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<SiteSummaryResponse> archiveSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.archiveSiteSummary(id, currentUser.getId()));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<SiteSummaryResponse> restoreSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.restoreSiteSummary(id, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        siteSummaryService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<SiteSummaryResponse> cloneSiteSummary(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse existing = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.cloneSite(id, currentUser.getId()));
    }

    @GetMapping("/{id}/revisions")
    public ResponseEntity<List<SiteSummaryRevisionDto>> getRevisions(@PathVariable("id") UUID id) {
        SiteSummaryResponse site = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(site.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.getRevisions(id));
    }

    @PostMapping("/{id}/revisions/{revisionId}/restore")
    public ResponseEntity<SiteSummaryResponse> restoreRevision(
            @PathVariable("id") UUID id,
            @PathVariable("revisionId") UUID revisionId,
            @CurrentUser UserPrincipal currentUser) {
        SiteSummaryResponse site = siteSummaryService.getById(id);
        if (!orgAccessControl.canAccess(site.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(siteSummaryService.restoreRevision(id, revisionId, currentUser.getId()));
    }
}
