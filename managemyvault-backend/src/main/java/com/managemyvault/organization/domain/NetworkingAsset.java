package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "networking_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkingAsset extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // File Sharing, LAN, MPLS, WAN, NAS/SAN, OOB, Printer Management, VPN, Wireless

    @Column(name = "subnet_cidr", length = 255)
    private String subnetCidr;

    @Column(length = 255)
    private String gateway;

    @Column(name = "vlan_id", length = 50)
    private String vlanId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Version
    private Long version;
}
