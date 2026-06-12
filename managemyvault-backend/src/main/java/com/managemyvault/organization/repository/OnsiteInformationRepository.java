package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.OnsiteInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OnsiteInformationRepository extends JpaRepository<OnsiteInformation, UUID> {
    Optional<OnsiteInformation> findByOrganizationId(UUID organizationId);
}
