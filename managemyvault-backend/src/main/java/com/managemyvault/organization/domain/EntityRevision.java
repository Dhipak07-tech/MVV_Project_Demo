package com.managemyvault.organization.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "entity_revisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "before_state", columnDefinition = "TEXT")
    private String beforeState;

    @Column(name = "after_state", columnDefinition = "TEXT")
    private String afterState;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Version
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
