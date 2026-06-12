package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.TrackerService;
import com.managemyvault.organization.web.dto.CreateTrackerRequest;
import com.managemyvault.organization.web.dto.TrackerResponse;
import com.managemyvault.organization.web.dto.UpdateTrackerRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/docs/trackers")
@RequiredArgsConstructor
@Validated
public class TrackerController {

    private final TrackerService trackerService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<TrackerResponse>> getTrackers(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(trackerService.getTrackersByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{trackerId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<TrackerResponse> getTracker(
            @PathVariable UUID organizationId,
            @PathVariable UUID trackerId) {
        return ResponseEntity.ok(trackerService.getTrackerById(organizationId, trackerId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<TrackerResponse> createTracker(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateTrackerRequest request,
            @CurrentUser UserPrincipal currentUser) {
        TrackerResponse response = trackerService.createTracker(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/docs/trackers/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{trackerId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<TrackerResponse> updateTracker(
            @PathVariable UUID organizationId,
            @PathVariable UUID trackerId,
            @RequestBody @Valid UpdateTrackerRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(trackerService.updateTracker(organizationId, trackerId, request, currentUser));
    }

    @DeleteMapping("/{trackerId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteTracker(
            @PathVariable UUID organizationId,
            @PathVariable UUID trackerId) {
        trackerService.deleteTracker(organizationId, trackerId);
        return ResponseEntity.noContent().build();
    }
}
