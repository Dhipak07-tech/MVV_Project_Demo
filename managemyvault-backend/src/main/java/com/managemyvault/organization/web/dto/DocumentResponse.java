package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Document;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class DocumentResponse {

    private UUID id;
    private UUID organizationId;
    private String title;
    private String content;
    private String category;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    public static DocumentResponse from(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .organizationId(doc.getOrganizationId())
                .title(doc.getTitle())
                .content(doc.getContent())
                .category(doc.getCategory())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .createdBy(doc.getCreatedBy())
                .updatedBy(doc.getUpdatedBy())
                .build();
    }
}
