package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "onsite_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnsiteInformation extends AuditableEntity {

    @Id
    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "parking_instructions", columnDefinition = "TEXT")
    private String parkingInstructions;

    @Column(name = "building_access", columnDefinition = "TEXT")
    private String buildingAccess;

    @Column(name = "server_room_access", columnDefinition = "TEXT")
    private String serverRoomAccess;

    @Column(name = "wifi_information", columnDefinition = "TEXT")
    private String wifiInformation;

    @Column(name = "key_locations", columnDefinition = "TEXT")
    private String keyLocations;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;
}
