package com.managemyvault.platform.repository;

import com.managemyvault.platform.domain.PlatformUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformUserRepository extends JpaRepository<PlatformUser, UUID> {

    Optional<PlatformUser> findByEmail(String email);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE PlatformUser p SET p.passwordHash = :passwordHash WHERE p.id = :id")
    void updatePassword(java.util.UUID id, String passwordHash);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE PlatformUser p SET p.lastLoginAt = :lastLoginAt WHERE p.id = :id")
    void updateLastLogin(java.util.UUID id, java.time.Instant lastLoginAt);
}
