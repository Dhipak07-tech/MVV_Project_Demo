package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTrackerRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Type is required")
    @Size(max = 50)
    private String type; // SSL, Domain

    @Size(max = 255)
    private String registrarOrIssuer;

    private LocalDate expiryDate;

    @NotNull(message = "Auto renew is required")
    private Boolean autoRenew;

    @Size(max = 255)
    private String dnsOrStrength;
}
