package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.PasswordService;
import com.managemyvault.organization.web.dto.CreatePasswordRequest;
import com.managemyvault.organization.web.dto.PasswordResponse;
import com.managemyvault.organization.web.dto.UpdatePasswordRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/docs/passwords")
@RequiredArgsConstructor
@Validated
public class PasswordController {

    private final PasswordService passwordService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<PasswordResponse>> getPasswords(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(passwordService.getPasswordsByOrgId(organizationId, search, pageable));
    }

    @GetMapping("/{passwordId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<PasswordResponse> getPassword(
            @PathVariable UUID organizationId,
            @PathVariable UUID passwordId) {
        return ResponseEntity.ok(passwordService.getPasswordById(organizationId, passwordId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<PasswordResponse> createPassword(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreatePasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        PasswordResponse response = passwordService.createPassword(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/docs/passwords/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{passwordId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<PasswordResponse> updatePassword(
            @PathVariable UUID organizationId,
            @PathVariable UUID passwordId,
            @RequestBody @Valid UpdatePasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(passwordService.updatePassword(organizationId, passwordId, request, currentUser));
    }

    @DeleteMapping("/{passwordId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deletePassword(
            @PathVariable UUID organizationId,
            @PathVariable UUID passwordId) {
        passwordService.deletePassword(organizationId, passwordId);
        return ResponseEntity.noContent().build();
    }
}
