package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePasswordRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 255)
    private String name;

    @NotBlank(message = "Username is required")
    @Size(max = 255)
    private String username;

    @NotBlank(message = "Password is required")
    @Size(max = 255)
    private String password;

    @Size(max = 255)
    private String url;

    @Size(max = 255)
    private String otpSecret;

    private String notes;

    @Size(max = 50)
    private String strength;
}
