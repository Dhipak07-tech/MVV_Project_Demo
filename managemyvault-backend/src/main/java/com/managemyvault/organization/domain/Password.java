package com.managemyvault.organization.domain;

import com.managemyvault.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "passwords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Password extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 255)
    private String username;

    @Column(name = "password_encrypted", nullable = false, length = 1000)
    private String passwordEncrypted;

    @Column(length = 255)
    private String iv;

    @Column(length = 255)
    private String url;

    @Column(name = "otp_secret", length = 255)
    private String otpSecret;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    private String strength;

    @Version
    private Long version;
}
