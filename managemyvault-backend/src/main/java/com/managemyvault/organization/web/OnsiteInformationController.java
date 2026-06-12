package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.OnsiteInformation;
import com.managemyvault.organization.service.OnsiteInformationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onsite-information")
@RequiredArgsConstructor
@Validated
public class OnsiteInformationController {

    private final OnsiteInformationService onsiteInformationService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<OnsiteInformation> getOnsiteInformation(
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(onsiteInformationService.getOrCreate(organizationId, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<OnsiteInformation> updateOnsiteInformation(
            @RequestBody OnsiteInformation info,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(info.getOrganizationId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(onsiteInformationService.update(info.getOrganizationId(), info, currentUser.getId()));
    }
}
