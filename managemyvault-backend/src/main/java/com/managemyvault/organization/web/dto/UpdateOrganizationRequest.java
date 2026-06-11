package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrganizationRequest {

    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @Size(max = 5000)
    private String description;

    @Size(max = 100)
    private String industry;

    @Size(max = 50)
    private String companySize;

    @Size(max = 500)
    private String website;

    @Size(max = 50)
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;

    @Size(max = 100)
    private String timezone;

    @Size(max = 10)
    private String countryCode;

    @Size(max = 255)
    private String addressLine1;

    @Size(max = 255)
    private String addressLine2;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String stateProvince;

    @Size(max = 20)
    private String postalCode;
}
