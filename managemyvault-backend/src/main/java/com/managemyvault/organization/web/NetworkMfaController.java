package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.NetworkMfaService;
import com.managemyvault.organization.web.dto.CreateNetworkMfaRequest;
import com.managemyvault.organization.web.dto.NetworkMfaResponse;
import com.managemyvault.organization.web.dto.UpdateNetworkMfaRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/docs/networks-mfa")
@RequiredArgsConstructor
@Validated
public class NetworkMfaController {

    private final NetworkMfaService networkMfaService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<NetworkMfaResponse>> getNetworkMfaList(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(networkMfaService.getNetworkMfaByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{entryId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkMfaResponse> getNetworkMfa(
            @PathVariable UUID organizationId,
            @PathVariable UUID entryId) {
        return ResponseEntity.ok(networkMfaService.getNetworkMfaById(organizationId, entryId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkMfaResponse> createNetworkMfa(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateNetworkMfaRequest request,
            @CurrentUser UserPrincipal currentUser) {
        NetworkMfaResponse response = networkMfaService.createNetworkMfa(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/docs/networks-mfa/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{entryId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<NetworkMfaResponse> updateNetworkMfa(
            @PathVariable UUID organizationId,
            @PathVariable UUID entryId,
            @RequestBody @Valid UpdateNetworkMfaRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(networkMfaService.updateNetworkMfa(organizationId, entryId, request, currentUser));
    }

    @DeleteMapping("/{entryId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteNetworkMfa(
            @PathVariable UUID organizationId,
            @PathVariable UUID entryId) {
        networkMfaService.deleteNetworkMfa(organizationId, entryId);
        return ResponseEntity.noContent().build();
    }
}
