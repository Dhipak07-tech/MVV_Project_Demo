package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.ActivityEvent;
import com.managemyvault.organization.service.ActivityEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/activity")
@RequiredArgsConstructor
@Validated
public class ActivityEventController {

    private final ActivityEventService activityEventService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<ActivityEventService.ActivityEventDto>> getEvents(
            @PathVariable("entityType") String entityType,
            @PathVariable("entityId") UUID entityId,
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(activityEventService.getEvents(entityType, entityId));
    }
}
