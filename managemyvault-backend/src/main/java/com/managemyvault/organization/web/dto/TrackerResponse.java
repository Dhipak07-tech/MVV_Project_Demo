package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Tracker;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class TrackerResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String type;
    private String registrarOrIssuer;
    private LocalDate expiryDate;
    private boolean autoRenew;
    private String dnsOrStrength;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    public static TrackerResponse from(Tracker tracker) {
        return TrackerResponse.builder()
                .id(tracker.getId())
                .organizationId(tracker.getOrganizationId())
                .name(tracker.getName())
                .type(tracker.getType())
                .registrarOrIssuer(tracker.getRegistrarOrIssuer())
                .expiryDate(tracker.getExpiryDate())
                .autoRenew(tracker.isAutoRenew())
                .dnsOrStrength(tracker.getDnsOrStrength())
                .createdAt(tracker.getCreatedAt())
                .updatedAt(tracker.getUpdatedAt())
                .createdBy(tracker.getCreatedBy())
                .updatedBy(tracker.getUpdatedBy())
                .build();
    }
}
