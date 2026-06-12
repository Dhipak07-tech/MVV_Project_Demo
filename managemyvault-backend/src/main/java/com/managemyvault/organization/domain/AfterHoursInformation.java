package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "after_hours_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AfterHoursInformation extends AuditableEntity {

    @Id
    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "alarm_codes", columnDefinition = "TEXT")
    private String alarmCodes;

    @Column(name = "after_hours_procedure", columnDefinition = "TEXT")
    private String afterHoursProcedure;

    @Column(name = "emergency_phone", length = 50)
    private String emergencyPhone;

    @Column(name = "escalation_procedure", columnDefinition = "TEXT")
    private String escalationProcedure;

    @Column(name = "security_vendor", length = 255)
    private String securityVendor;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;
}
