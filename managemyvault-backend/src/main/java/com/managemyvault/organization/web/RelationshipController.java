package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Relationship;
import com.managemyvault.organization.service.RelationshipService;
import com.managemyvault.organization.service.RelationshipService.RelationshipDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/relationships")
@RequiredArgsConstructor
@Validated
public class RelationshipController {

    private final RelationshipService relationshipService;
    private final OrgAccessControl orgAccessControl;

    @Getter
    @Setter
    public static class LinkRequest {
        @NotNull
        private UUID organizationId;
        @NotNull
        private String sourceType;
        @NotNull
        private UUID sourceId;
        @NotNull
        private String targetType;
        @NotNull
        private UUID targetId;
    }

    @PostMapping
    public ResponseEntity<Relationship> link(
            @RequestBody @Valid LinkRequest request,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(request.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Relationship rel = relationshipService.link(
                request.getOrganizationId(),
                request.getSourceType(),
                request.getSourceId(),
                request.getTargetType(),
                request.getTargetId(),
                currentUser.getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(rel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unlink(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Relationship relationship = relationshipService.getById(id);
        if (!orgAccessControl.canAccess(relationship.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        relationshipService.unlink(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<RelationshipDto>> getRelationships(
            @PathVariable("entityType") String entityType,
            @PathVariable("entityId") UUID entityId,
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(relationshipService.getRelationshipsForEntity(entityType, entityId));
    }
}
