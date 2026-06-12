package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.AfterHoursInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AfterHoursInformationRepository extends JpaRepository<AfterHoursInformation, UUID> {
    Optional<AfterHoursInformation> findByOrganizationId(UUID organizationId);
}
