package com.managemyvault.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("orgAccessControl")
public class OrgAccessControl {

    public boolean canAccess(UUID organizationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            return false;
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.isPlatformUser()) {
            return true;
        }
        return principal.getOrganizationId() != null && principal.getOrganizationId().equals(organizationId);
    }

    public boolean canManage(UUID organizationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            return false;
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        if (principal.isPlatformUser()) {
            return true;
        }
        boolean isOrgAdmin = "ORG_ADMIN".equals(principal.getRole());
        return principal.getOrganizationId() != null && principal.getOrganizationId().equals(organizationId) && isOrgAdmin;
    }
}
