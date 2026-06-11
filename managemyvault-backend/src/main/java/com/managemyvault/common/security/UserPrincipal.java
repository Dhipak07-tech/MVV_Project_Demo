package com.managemyvault.common.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Custom UserDetails implementation carrying both platform and org context.
 */
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final String fullName;
    private final String role;
    private final UUID organizationId; // null for platform users
    private final boolean active;

    /**
     * Create a UserPrincipal for a platform-level user.
     */
    public static UserPrincipal platformUser(UUID id, String email, String password,
                                              String fullName, String role) {
        return new UserPrincipal(id, email, password, fullName, role, null, true);
    }

    /**
     * Create a UserPrincipal for an organization-scoped member.
     */
    public static UserPrincipal orgMember(UUID id, String email, String password,
                                           String fullName, String role, UUID orgId) {
        return new UserPrincipal(id, email, password, fullName, role, orgId, true);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    public boolean isPlatformUser() {
        return organizationId == null;
    }
}
