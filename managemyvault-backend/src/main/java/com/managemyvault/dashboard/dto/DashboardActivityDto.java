package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class DashboardActivityDto {
    private List<ActivityItem> recentActivity;
    private List<UpdatedRecordItem> recentlyUpdated;

    @Data
    @Builder
    public static class ActivityItem {
        private String id;
        private String user;
        private String action;
        private String entityType;
        private String entityId;
        private String details;
        private String organization;
        private String organizationId;
        private Instant timestamp;
    }

    @Data
    @Builder
    public static class UpdatedRecordItem {
        private String id;
        private String title;
        private String type; // PASSWORD, DOCUMENT, SITE, CONTACT, ASSET
        private String updatedBy;
        private Instant updatedAt;
        private String organization;
        private String organizationId;
    }
}
