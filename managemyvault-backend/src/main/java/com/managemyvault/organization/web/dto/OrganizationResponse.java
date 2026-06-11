package com.managemyvault.organization.web.dto;

import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.OrganizationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Getter
@Builder
public class OrganizationResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private String industry;
    private String companySize;
    private String website;
    private String phone;
    private String email;
    private String logoUrl;
    private OrganizationStatus status;
    private Integer healthScore;
    private String timezone;
    private String countryCode;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String stateProvince;
    private String postalCode;
    private Map<String, Object> metadata;
    private Map<String, Object> settings;
    private Instant createdAt;
    private Instant updatedAt;
    private UUID createdBy;

    // Computed stats
    private long memberCount;
    private long assetCount;
    private long passwordCount;
    private long documentCount;
    private long contactCount;
    private LocalDateTime lastActivity;

    /**
     * Map from entity to response DTO.
     */
    public static OrganizationResponse from(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .description(org.getDescription())
                .industry(org.getIndustry())
                .companySize(org.getCompanySize())
                .website(org.getWebsite())
                .phone(org.getPhone())
                .email(org.getEmail())
                .logoUrl(org.getLogoUrl())
                .status(org.getStatus())
                .healthScore(org.getHealthScore())
                .timezone(org.getTimezone())
                .countryCode(org.getCountryCode())
                .addressLine1(org.getAddressLine1())
                .addressLine2(org.getAddressLine2())
                .city(org.getCity())
                .stateProvince(org.getStateProvince())
                .postalCode(org.getPostalCode())
                .metadata(org.getMetadata())
                .settings(org.getSettings())
                .createdAt(org.getCreatedAt())
                .updatedAt(org.getUpdatedAt())
                .createdBy(org.getCreatedBy())
                .memberCount(org.getMemberCount())
                .assetCount(org.getAssetCount())
                .passwordCount(org.getPasswordCount())
                .documentCount(org.getDocumentCount())
                .contactCount(org.getContactCount())
                .lastActivity(org.getLastActivity())
                .build();
    }
}
