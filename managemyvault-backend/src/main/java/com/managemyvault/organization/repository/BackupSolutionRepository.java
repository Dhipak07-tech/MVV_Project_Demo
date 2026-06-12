package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.BackupSolution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BackupSolutionRepository extends JpaRepository<BackupSolution, UUID> {

    List<BackupSolution> findByOrganizationId(UUID organizationId);

    List<BackupSolution> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<BackupSolution> findByOrganizationIdAndTypeAndNameContainingIgnoreCase(UUID organizationId, String type, String name, Pageable pageable);
    
    Page<BackupSolution> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);
}
