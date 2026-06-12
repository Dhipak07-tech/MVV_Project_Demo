package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateNetworkMfaRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 255)
    private String title;

    @NotBlank(message = "Type is required")
    @Size(max = 50)
    private String type; // Network, MFA, Issue, Maintenance

    @Size(max = 255)
    private String param1;

    @Size(max = 255)
    private String param2;

    private String notes;
}
