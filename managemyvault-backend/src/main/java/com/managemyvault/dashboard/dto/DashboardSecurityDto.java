package com.managemyvault.dashboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSecurityDto {
    private long expiredPasswords;
    private long weakPasswords;
    private long reusedPasswords;
    private long missingRotationPasswords;
    private long expiredDomains;
    private long expiredSslCertificates;
    private long unreviewedExceptions;
    private int securityHealthScore;
}
