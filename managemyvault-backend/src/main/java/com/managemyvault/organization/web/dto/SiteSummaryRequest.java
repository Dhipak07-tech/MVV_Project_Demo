package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteSummaryRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Organization ID is required")
    private UUID organizationId;

    private String timezone;

    private String businessHours;

    private String notes;

    private UUID primaryContactId;

    private UUID emergencyContactId;

    private UUID authorizationContactId;
}
