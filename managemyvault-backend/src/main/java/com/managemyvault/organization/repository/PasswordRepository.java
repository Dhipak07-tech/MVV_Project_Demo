package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Password;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PasswordRepository extends JpaRepository<Password, UUID> {

    List<Password> findByOrganizationId(UUID organizationId);

    Page<Password> findByOrganizationId(UUID organizationId, Pageable pageable);

    Page<Password> findByOrganizationIdAndNameContainingIgnoreCase(UUID organizationId, String name, Pageable pageable);
}
