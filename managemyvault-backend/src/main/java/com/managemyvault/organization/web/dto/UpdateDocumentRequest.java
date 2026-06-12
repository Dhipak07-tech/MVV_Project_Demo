package com.managemyvault.organization.web.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateDocumentRequest {

    @Size(min = 2, max = 255)
    private String title;

    private String content;

    @Size(max = 255)
    private String category;
}
