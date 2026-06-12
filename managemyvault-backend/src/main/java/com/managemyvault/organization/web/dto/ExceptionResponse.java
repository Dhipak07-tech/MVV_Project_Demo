package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.ExceptionEntry;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class ExceptionResponse {

    private UUID id;
    private UUID organizationId;
    private String title;
    private String type;
    private String status;
    private String justification;
    private String reviewer;
    private LocalDate dueDate;
    private String priority;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;
    private UUID updatedBy;

    public static ExceptionResponse from(ExceptionEntry entry) {
        return ExceptionResponse.builder()
                .id(entry.getId())
                .organizationId(entry.getOrganizationId())
                .title(entry.getTitle())
                .type(entry.getType())
                .status(entry.getStatus())
                .justification(entry.getJustification())
                .reviewer(entry.getReviewer())
                .dueDate(entry.getDueDate())
                .priority(entry.getPriority())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .createdBy(entry.getCreatedBy())
                .updatedBy(entry.getUpdatedBy())
                .build();
    }
}
