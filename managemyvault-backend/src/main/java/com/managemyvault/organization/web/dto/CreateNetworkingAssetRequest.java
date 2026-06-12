package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateNetworkingAssetRequest {

    @NotBlank(message = "Networking configuration name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Networking configuration type is required")
    @Size(max = 50)
    private String type;

    @Size(max = 255)
    private String subnetCidr;

    @Size(max = 255)
    private String gateway;

    @Size(max = 50)
    private String vlanId;

    private String details;
}
