package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Password;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class PasswordResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String username;
    private String password;
    private String url;
    private String otpSecret;
    private String notes;
    private String strength;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    public static PasswordResponse from(Password pw, String decryptedPassword) {
        return PasswordResponse.builder()
                .id(pw.getId())
                .organizationId(pw.getOrganizationId())
                .name(pw.getName())
                .username(pw.getUsername())
                .password(decryptedPassword)
                .url(pw.getUrl())
                .otpSecret(pw.getOtpSecret())
                .notes(pw.getNotes())
                .strength(pw.getStrength())
                .createdAt(pw.getCreatedAt())
                .updatedAt(pw.getUpdatedAt())
                .createdBy(pw.getCreatedBy())
                .updatedBy(pw.getUpdatedBy())
                .build();
    }
}
