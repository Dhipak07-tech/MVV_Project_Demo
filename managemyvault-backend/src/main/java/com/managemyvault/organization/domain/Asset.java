package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // Firewall, Printer, Switch, Server, Workstation, Laptop, UPS, ESX Host, Virtualization

    @Column(name = "ip_address", length = 255)
    private String ipAddress;

    @Column(name = "mac_address", length = 255)
    private String macAddress;

    @Column(name = "serial_number", length = 255)
    private String serialNumber;

    @Column(length = 255)
    private String model;

    @Column(length = 255)
    private String manufacturer;

    @Column(name = "os_version", length = 255)
    private String osVersion;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;
}
