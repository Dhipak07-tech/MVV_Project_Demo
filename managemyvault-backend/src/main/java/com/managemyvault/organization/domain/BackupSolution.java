package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "backup_solutions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupSolution extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // client-backups, veeam-backups, legacy-backups, msp-backup

    @Column(length = 255)
    private String destination;

    @Column(length = 50)
    private String frequency;

    @Column(name = "retention_policy", length = 255)
    private String retentionPolicy;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;
}
