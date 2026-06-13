package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatisticsDto {
    private List<StatisticCard> cards;

    @Data
    @Builder
    public static class StatisticCard {
        private String title;
        private long count;
        private long change30Days;
        private double growthRate;
        private String trend; // UP, DOWN, NEUTRAL
    }
}
