package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "site_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSummary extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 100)
    private String timezone;

    @Column(name = "business_hours", length = 255)
    private String businessHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "primary_contact_id")
    private UUID primaryContactId;

    @Column(name = "emergency_contact_id")
    private UUID emergencyContactId;

    @Column(name = "authorization_contact_id")
    private UUID authorizationContactId;

    @Column(nullable = false)
    private Boolean active;

    @Version
    private Long version;
}
