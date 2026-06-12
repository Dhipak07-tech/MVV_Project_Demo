package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 255)
    private String city;

    @Column(length = 255)
    private String country;

    private String state;
    private String zip;
    private String phone;
    private String timezone;

    @Column(name = "primary_location", nullable = false)
    private Boolean primaryLocation;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    public void defaults() {
        if (primaryLocation == null) {
            primaryLocation = false;
        }
    }
}
