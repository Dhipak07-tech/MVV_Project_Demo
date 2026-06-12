package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateExceptionRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 255)
    private String title;

    @NotBlank(message = "Type is required")
    @Size(max = 50)
    private String type; // Standards, Contract, RFC, Change

    @NotBlank(message = "Status is required")
    @Size(max = 50)
    private String status; // Approved, Pending, Draft, Expired

    private String justification;

    @Size(max = 255)
    private String reviewer;

    private LocalDate dueDate;

    @Size(max = 50)
    private String priority;
}
