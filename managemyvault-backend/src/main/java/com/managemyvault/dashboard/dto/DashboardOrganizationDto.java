package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class DashboardOrganizationDto {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
    private int healthScore;
    private long siteCount;
    private long assetCount;
    private boolean pinned;
    private boolean favorite;
}
