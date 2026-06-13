package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardTrendDto {
    private List<TrendDataPoint> trends;

    @Data
    @Builder
    public static class TrendDataPoint {
        private String date;
        private long assets;
        private long passwords;
        private long documents;
        private long contacts;
        private long sites;
    }
}
