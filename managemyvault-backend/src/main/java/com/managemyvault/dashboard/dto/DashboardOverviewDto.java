package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardOverviewDto {
    private int healthScore;
    private String healthStatus;
    private Map<String, Integer> healthBreakdown;
    private List<NotificationDto> notifications;

    @Data
    @Builder
    public static class NotificationDto {
        private String id;
        private String severity; // CRITICAL, WARNING, INFO
        private String title;
        private String message;
        private Instant timestamp;
    }
}
