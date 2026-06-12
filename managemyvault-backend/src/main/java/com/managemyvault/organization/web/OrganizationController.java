package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.OrganizationStatus;
import com.managemyvault.organization.service.OrganizationQueryService;
import com.managemyvault.organization.service.OrganizationService;
import com.managemyvault.organization.web.dto.CreateOrganizationRequest;
import com.managemyvault.organization.web.dto.OrganizationResponse;
import com.managemyvault.organization.web.dto.OrganizationSummaryResponse;
import com.managemyvault.organization.web.dto.UpdateOrganizationRequest;
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
import java.util.List;
import java.util.UUID;
import com.managemyvault.organization.search.OrganizationSearchDocument;
import com.managemyvault.organization.search.OrganizationSearchService;

/**
 * Organization REST controller.
 * CONSTRAINT-008: No @Transactional here. Service layer owns transaction boundaries.
 */
@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Validated
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationQueryService queryService;
    private final OrganizationSearchService searchService;

    /**
     * List/search organizations with optional filters.
     * Platform admins only.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Page<OrganizationSummaryResponse>> listOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrganizationStatus status,
            @RequestParam(required = false) String industry,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return ResponseEntity.ok(queryService.findAll(search, status, industry, pageable));
    }

    /**
     * Get a single organization by ID.
     */
    @GetMapping("/{organizationId}")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @PathVariable UUID organizationId) {
        return ResponseEntity.ok(queryService.findById(organizationId));
    }

    /**
     * Create a new organization.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @RequestBody @Valid CreateOrganizationRequest request,
            @CurrentUser UserPrincipal currentUser) {
        OrganizationResponse response = organizationService.create(request, currentUser);
        URI location = URI.create("/api/v1/organizations/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    /**
     * Update an existing organization.
     */
    @PutMapping("/{organizationId}")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable UUID organizationId,
            @RequestBody @Valid UpdateOrganizationRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(organizationService.update(organizationId, request, currentUser));
    }

    /**
     * Archive (soft-delete) an organization.
     */
    @PostMapping("/{organizationId}/archive")
    @PreAuthorize("hasRole('ULTRA_SUPER_ADMIN')")
    public ResponseEntity<Void> archiveOrganization(
            @PathVariable UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        organizationService.archive(organizationId, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restore an archived organization.
     */
    @PostMapping("/{organizationId}/restore")
    @PreAuthorize("hasRole('ULTRA_SUPER_ADMIN')")
    public ResponseEntity<OrganizationResponse> restoreOrganization(
            @PathVariable UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(organizationService.restore(organizationId, currentUser));
    }

    /**
     * Get platform-wide organization statistics.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<OrganizationQueryService.OrganizationStats> getStats() {
        return ResponseEntity.ok(queryService.getStats());
    }

    /**
     * Global Elasticsearch search across organizations.
     * Platform admins only.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<OrganizationSearchDocument>> searchOrganizations(
            @RequestParam String query) {
        return ResponseEntity.ok(searchService.searchOrganizations(query));
    }
}
