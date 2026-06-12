package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.NetworkMfa;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class NetworkMfaResponse {

    private UUID id;
    private UUID organizationId;
    private String title;
    private String type;
    private String param1;
    private String param2;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    public static NetworkMfaResponse from(NetworkMfa entry) {
        return NetworkMfaResponse.builder()
                .id(entry.getId())
                .organizationId(entry.getOrganizationId())
                .title(entry.getTitle())
                .type(entry.getType())
                .param1(entry.getParam1())
                .param2(entry.getParam2())
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .createdBy(entry.getCreatedBy())
                .updatedBy(entry.getUpdatedBy())
                .build();
    }
}
