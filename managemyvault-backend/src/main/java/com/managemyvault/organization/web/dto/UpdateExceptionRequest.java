package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateExceptionRequest {

    @Size(min = 2, max = 255)
    private String title;

    @Size(max = 50)
    private String status;

    private String justification;

    @Size(max = 255)
    private String reviewer;

    private LocalDate dueDate;

    @Size(max = 50)
    private String priority;
}
