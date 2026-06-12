package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Location;
import com.managemyvault.organization.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
@Validated
public class LocationController {

    private final LocationService locationService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<List<Location>> getByOrganization(
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(locationService.getByOrganizationId(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getById(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Location location = locationService.getById(id);
        if (!orgAccessControl.canAccess(location.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(location);
    }

    @PostMapping
    public ResponseEntity<Location> create(
            @RequestParam("organizationId") UUID organizationId,
            @RequestBody Location location,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(locationService.create(organizationId, location, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> update(
            @PathVariable("id") UUID id,
            @RequestBody Location location,
            @CurrentUser UserPrincipal currentUser) {
        Location existing = locationService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(locationService.update(id, location, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Location existing = locationService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        locationService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
