package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAssetRequest {

    @NotBlank(message = "Asset name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Asset type is required")
    @Size(max = 50)
    private String type;

    @Size(max = 255)
    private String ipAddress;

    @Size(max = 255)
    private String macAddress;

    @Size(max = 255)
    private String serialNumber;

    @Size(max = 255)
    private String model;

    @Size(max = 255)
    private String manufacturer;

    @Size(max = 255)
    private String osVersion;

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status;

    private String notes;
}
