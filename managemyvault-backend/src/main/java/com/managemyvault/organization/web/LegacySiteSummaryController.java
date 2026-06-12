package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.LegacySiteSummary;
import com.managemyvault.organization.service.LegacySiteSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/legacy-site-summaries")
@RequiredArgsConstructor
@Validated
public class LegacySiteSummaryController {

    private final LegacySiteSummaryService service;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<List<LegacySiteSummary>> getByOrganization(
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.getByOrganizationId(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LegacySiteSummary> getById(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        LegacySiteSummary summary = service.getById(id);
        if (!orgAccessControl.canAccess(summary.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<LegacySiteSummary> create(
            @RequestBody LegacySiteSummary summary,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(summary.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.create(summary, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LegacySiteSummary> update(
            @PathVariable("id") UUID id,
            @RequestBody LegacySiteSummary summary,
            @CurrentUser UserPrincipal currentUser) {
        LegacySiteSummary existing = service.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(service.update(id, summary, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        LegacySiteSummary existing = service.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        service.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
