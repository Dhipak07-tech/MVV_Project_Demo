package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.OrganizationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * Lightweight organization summary for grid/list views.
 */
@Getter
@Builder
public class OrganizationSummaryResponse {

    private UUID id;
    private String name;
    private String slug;
    private String industry;
    private String logoUrl;
    private OrganizationStatus status;
    private Integer healthScore;
    private Instant createdAt;

    // Computed stats
    private long memberCount;
    private long assetCount;
    private long passwordCount;
    private long documentCount;

    public static OrganizationSummaryResponse from(Organization org) {
        return OrganizationSummaryResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .industry(org.getIndustry())
                .logoUrl(org.getLogoUrl())
                .status(org.getStatus())
                .healthScore(org.getHealthScore())
                .createdAt(org.getCreatedAt())
                .memberCount(org.getMemberCount())
                .assetCount(org.getAssetCount())
                .passwordCount(org.getPasswordCount())
                .documentCount(org.getDocumentCount())
                .build();
    }
}
