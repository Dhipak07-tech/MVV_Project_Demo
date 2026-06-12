package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDocumentRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 255)
    private String title;

    private String content;

    @NotBlank(message = "Category is required")
    @Size(max = 255)
    private String category;
}
