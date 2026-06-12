package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.AppService;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AppResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String type;
    private String provider;
    private String licenseKey;
    private String url;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;

    public static AppResponse from(AppService app) {
        return AppResponse.builder()
                .id(app.getId())
                .organizationId(app.getOrganizationId())
                .name(app.getName())
                .type(app.getType())
                .provider(app.getProvider())
                .licenseKey(app.getLicenseKey())
                .url(app.getUrl())
                .notes(app.getNotes())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .createdBy(app.getCreatedBy())
                .build();
    }
}
