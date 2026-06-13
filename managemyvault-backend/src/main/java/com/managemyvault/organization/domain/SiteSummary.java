package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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

    @Column(name = "hours_of_operation", length = 255)
    private String hoursOfOperation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "primary_contact_id")
    private UUID primaryContactId;

    @Column(name = "emergency_contact_1_id")
    private UUID emergencyContact1Id;

    @Column(name = "emergency_contact_2_id")
    private UUID emergencyContact2Id;

    @Column(name = "authorization_contact_id")
    private UUID authorizationContactId;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private Boolean isArchived = false;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "archived_by")
    private UUID archivedBy;

    @Version
    private Long version;
}
