package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.AppServiceService;
import com.managemyvault.organization.web.dto.AppResponse;
import com.managemyvault.organization.web.dto.CreateAppRequest;
import com.managemyvault.organization.web.dto.UpdateAppRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/apps")
@RequiredArgsConstructor
@Validated
public class AppServiceController {

    private final AppServiceService appServiceService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<AppResponse>> getApps(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(appServiceService.getAppsByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{appId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AppResponse> getApp(
            @PathVariable UUID organizationId,
            @PathVariable UUID appId) {
        return ResponseEntity.ok(appServiceService.getAppById(organizationId, appId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AppResponse> createApp(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateAppRequest request,
            @CurrentUser UserPrincipal currentUser) {
        AppResponse response = appServiceService.createApp(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/apps/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{appId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AppResponse> updateApp(
            @PathVariable UUID organizationId,
            @PathVariable UUID appId,
            @RequestBody @Valid UpdateAppRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(appServiceService.updateApp(organizationId, appId, request, currentUser));
    }

    @DeleteMapping("/{appId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteApp(
            @PathVariable UUID organizationId,
            @PathVariable UUID appId) {
        appServiceService.deleteApp(organizationId, appId);
        return ResponseEntity.noContent().build();
    }
}
