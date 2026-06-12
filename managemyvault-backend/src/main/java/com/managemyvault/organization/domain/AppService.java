package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "app_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppService extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // active-directory, applications, email, licensing, vendors, website-provider, security-services, voice-pbx-fax

    @Column(length = 255)
    private String provider;

    @Column(name = "license_key", length = 500)
    private String licenseKey;

    @Column(length = 500)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;
}
