package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.AfterHoursInformation;
import com.managemyvault.organization.service.AfterHoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/after-hours")
@RequiredArgsConstructor
@Validated
public class AfterHoursController {

    private final AfterHoursService afterHoursService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<AfterHoursInformation> getAfterHours(
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(afterHoursService.getOrCreate(organizationId, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<AfterHoursInformation> updateAfterHours(
            @RequestBody AfterHoursInformation info,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(info.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(afterHoursService.update(info.getOrganizationId(), info, currentUser.getId()));
    }
}
