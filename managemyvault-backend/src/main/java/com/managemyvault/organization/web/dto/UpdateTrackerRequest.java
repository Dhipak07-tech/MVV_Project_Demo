package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateTrackerRequest {

    @Size(min = 2, max = 255)
    private String name;

    @Size(max = 255)
    private String registrarOrIssuer;

    private LocalDate expiryDate;

    private Boolean autoRenew;

    @Size(max = 255)
    private String dnsOrStrength;
}
