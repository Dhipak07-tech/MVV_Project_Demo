package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(nullable = false)
    private String name;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = false)
    private String role;

    private String email;
    private String phone;
    private String mobile;
    private String department;

    @Column(name = "primary_contact", nullable = false)
    private Boolean primaryContact;

    @Column(name = "emergency_contact", nullable = false)
    private Boolean emergencyContact;

    @Column(name = "authorization_contact", nullable = false)
    private Boolean authorizationContact;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Version
    private Long version;

    @PrePersist
    @PreUpdate
    public void updateFullName() {
        String f = firstName != null ? firstName : "";
        String l = lastName != null ? lastName : "";
        this.name = (f + " " + l).trim();
        if (this.name.isEmpty()) {
            this.name = "Unnamed Contact";
        }
        if (this.primaryContact == null) this.primaryContact = false;
        if (this.emergencyContact == null) this.emergencyContact = false;
        if (this.authorizationContact == null) this.authorizationContact = false;
        if (this.isActive == null) this.isActive = true;
    }
}
