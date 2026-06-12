package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "trackers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tracker extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // SSL, Domain

    @Column(name = "registrar_or_issuer", length = 255)
    private String registrarOrIssuer;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "auto_renew", nullable = false)
    @Builder.Default
    private boolean autoRenew = true;

    @Column(name = "dns_or_strength", length = 255)
    private String dnsOrStrength;

    @Version
    private Long version;
}
