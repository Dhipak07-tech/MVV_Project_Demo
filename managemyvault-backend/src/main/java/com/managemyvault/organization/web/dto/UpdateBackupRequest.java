package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateBackupRequest {

    @NotBlank(message = "Backup name is required")
    @Size(min = 2, max = 255)
    private String name;

    @Size(max = 255)
    private String destination;

    @Size(max = 50)
    private String frequency;

    @Size(max = 255)
    private String retentionPolicy;

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;

    private String notes;
}
