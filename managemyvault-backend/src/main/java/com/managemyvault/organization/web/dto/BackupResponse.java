package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.BackupSolution;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class BackupResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String type;
    private String destination;
    private String frequency;
    private String retentionPolicy;
    private String status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;

    public static BackupResponse from(BackupSolution backup) {
        return BackupResponse.builder()
                .id(backup.getId())
                .organizationId(backup.getOrganizationId())
                .name(backup.getName())
                .type(backup.getType())
                .destination(backup.getDestination())
                .frequency(backup.getFrequency())
                .retentionPolicy(backup.getRetentionPolicy())
                .status(backup.getStatus())
                .notes(backup.getNotes())
                .createdAt(backup.getCreatedAt())
                .updatedAt(backup.getUpdatedAt())
                .createdBy(backup.getCreatedBy())
                .build();
    }
}
