package com.managemyvault.common.health;

import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MinioHealthIndicator implements HealthIndicator {

    private final MinioClient minioClient;
    private final String minioBucketName;

    @Override
    public Health health() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioBucketName).build()
            );
            return Health.up()
                    .withDetail("bucket", minioBucketName)
                    .withDetail("bucketExists", exists)
                    .build();
        } catch (Exception e) {
            return Health.down(e)
                    .withDetail("bucket", minioBucketName)
                    .build();
        }
    }
}
