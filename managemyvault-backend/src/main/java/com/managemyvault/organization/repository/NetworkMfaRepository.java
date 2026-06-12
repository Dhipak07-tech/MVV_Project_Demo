package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.NetworkMfa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NetworkMfaRepository extends JpaRepository<NetworkMfa, UUID> {

    List<NetworkMfa> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<NetworkMfa> findByOrganizationIdAndTypeAndTitleContainingIgnoreCase(
            UUID organizationId, String type, String title, Pageable pageable);
}
