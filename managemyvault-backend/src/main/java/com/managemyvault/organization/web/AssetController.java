package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.AssetService;
import com.managemyvault.organization.web.dto.AssetResponse;
import com.managemyvault.organization.web.dto.CreateAssetRequest;
import com.managemyvault.organization.web.dto.UpdateAssetRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/assets")
@RequiredArgsConstructor
@Validated
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<AssetResponse>> getAssets(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(assetService.getAssetsByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AssetResponse> getAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(assetService.getAssetById(organizationId, assetId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AssetResponse> createAsset(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateAssetRequest request,
            @CurrentUser UserPrincipal currentUser) {
        AssetResponse response = assetService.createAsset(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/assets/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId,
            @RequestBody @Valid UpdateAssetRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(assetService.updateAsset(organizationId, assetId, request, currentUser));
    }

    @DeleteMapping("/{assetId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable UUID organizationId,
            @PathVariable UUID assetId) {
        assetService.deleteAsset(organizationId, assetId);
        return ResponseEntity.noContent().build();
    }
}
