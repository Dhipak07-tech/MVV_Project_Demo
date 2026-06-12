package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.NetworkingAssetService;
import com.managemyvault.organization.web.dto.CreateNetworkingAssetRequest;
import com.managemyvault.organization.web.dto.NetworkingAssetResponse;
import com.managemyvault.organization.web.dto.UpdateNetworkingAssetRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/networking")
@RequiredArgsConstructor
@Validated
public class NetworkingAssetController {

    private final NetworkingAssetService networkingAssetService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<NetworkingAssetResponse>> getNetworkingAssets(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(networkingAssetService.getNetworkingAssetsByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkingAssetResponse> getNetworkingAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(networkingAssetService.getNetworkingAssetById(organizationId, assetId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkingAssetResponse> createNetworkingAsset(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateNetworkingAssetRequest request,
            @CurrentUser UserPrincipal currentUser) {
        NetworkingAssetResponse response = networkingAssetService.createNetworkingAsset(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/networking/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkingAssetResponse> updateNetworkingAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId,
            @RequestBody @Valid UpdateNetworkingAssetRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(networkingAssetService.updateNetworkingAsset(organizationId, assetId, request, currentUser));
    }

    @DeleteMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteNetworkingAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId) {
        networkingAssetService.deleteNetworkingAsset(organizationId, assetId);
        return ResponseEntity.noContent().build();
    }
}
