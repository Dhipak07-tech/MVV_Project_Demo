package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "exceptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExceptionEntry extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 50)
    private String type; // Standards, Contract, RFC, Change

    @Column(nullable = false, length = 50)
    private String status; // Approved, Pending, Draft, Expired

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Column(length = 255)
    private String reviewer;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 50)
    private String priority;

    @Version
    private Long version;
}
