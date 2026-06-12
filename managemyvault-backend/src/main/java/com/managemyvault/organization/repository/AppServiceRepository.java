package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.AppService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AppServiceRepository extends JpaRepository<AppService, UUID> {

    List<AppService> findByOrganizationId(UUID organizationId);

    List<AppService> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<AppService> findByOrganizationIdAndTypeAndNameContainingIgnoreCase(UUID organizationId, String type, String name, Pageable pageable);
    
    Page<AppService> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);
}
