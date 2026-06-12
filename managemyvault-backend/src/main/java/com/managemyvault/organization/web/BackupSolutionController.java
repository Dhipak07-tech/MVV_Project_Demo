package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.service.BackupSolutionService;
import com.managemyvault.organization.web.dto.BackupResponse;
import com.managemyvault.organization.web.dto.CreateBackupRequest;
import com.managemyvault.organization.web.dto.UpdateBackupRequest;
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
@RequestMapping("/api/v1/org/{organizationId}/backups")
@RequiredArgsConstructor
@Validated
public class BackupSolutionController {

    private final BackupSolutionService backupSolutionService;

    @GetMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Page<BackupResponse>> getBackups(
            @PathVariable UUID organizationId,
            @RequestParam String type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(backupSolutionService.getBackupsByOrgIdAndType(organizationId, type, search, pageable));
    }

    @GetMapping("/{backupId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<BackupResponse> getBackup(
            @PathVariable UUID organizationId,
            @PathVariable UUID backupId) {
        return ResponseEntity.ok(backupSolutionService.getBackupById(organizationId, backupId));
    }

    @PostMapping
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<BackupResponse> createBackup(
            @PathVariable UUID organizationId,
            @RequestBody @Valid CreateBackupRequest request,
            @CurrentUser UserPrincipal currentUser) {
        BackupResponse response = backupSolutionService.createBackup(organizationId, request, currentUser);
        URI location = URI.create("/api/v1/org/" + organizationId + "/backups/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{backupId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<BackupResponse> updateBackup(
            @PathVariable UUID organizationId,
            @PathVariable UUID backupId,
            @RequestBody @Valid UpdateBackupRequest request,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(backupSolutionService.updateBackup(organizationId, backupId, request, currentUser));
    }

    @DeleteMapping("/{backupId}")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Void> deleteBackup(
            @PathVariable UUID organizationId,
            @PathVariable UUID backupId) {
        backupSolutionService.deleteBackup(organizationId, backupId);
        return ResponseEntity.noContent().build();
    }
}
