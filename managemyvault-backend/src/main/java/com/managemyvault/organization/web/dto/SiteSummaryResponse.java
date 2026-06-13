package com.managemyvault.organization.web.dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSummaryResponse {
    private UUID id;
    private UUID organizationId;
    private String title;
    private String timezone;
    private String hoursOfOperation;
    private String notes;

    private UUID primaryContactId;
    private String primaryContactName;
    
    private UUID emergencyContact1Id;
    private String emergencyContact1Name;
    
    private UUID emergencyContact2Id;
    private String emergencyContact2Name;
    
    private UUID authorizationContactId;
    private String authorizationContactName;

    private Boolean isArchived;
    private LocalDateTime archivedAt;
    private UUID archivedBy;

    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    private long locationCount;
    private long passwordCount;
    private long documentCount;
    private long assetCount;
}
