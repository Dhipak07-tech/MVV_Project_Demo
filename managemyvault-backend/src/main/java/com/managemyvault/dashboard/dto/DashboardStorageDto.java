package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStorageDto {
    private long databaseSizeBytes;
    private String databaseSizeReadable;
    private long minioUsageBytes;
    private String minioUsageReadable;
    private long attachmentCount;
    private long documentCount;
    private double averageUploadSizeBytes;
    private String averageUploadSizeReadable;
    private List<StorageDataPoint> trends;

    @Data
    @Builder
    public static class StorageDataPoint {
        private String date;
        private long bytes;
    }
}
