package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateNetworkMfaRequest {

    @Size(min = 2, max = 255)
    private String title;

    @Size(max = 255)
    private String param1;

    @Size(max = 255)
    private String param2;

    private String notes;
}
