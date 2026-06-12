package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAssetRequest {

    @Size(min = 2, max = 255)
    private String name;

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

    @Size(max = 50)
    private String status;

    private String notes;
}
