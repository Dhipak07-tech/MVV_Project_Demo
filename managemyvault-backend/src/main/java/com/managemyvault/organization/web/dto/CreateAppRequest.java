package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAppRequest {

    @NotBlank(message = "App service name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "App service type is required")
    @Size(max = 50)
    private String type;

    @Size(max = 255)
    private String provider;

    @Size(max = 500)
    private String licenseKey;

    @Size(max = 500)
    private String url;

    private String notes;
}
