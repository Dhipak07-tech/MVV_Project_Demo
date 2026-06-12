package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {

    List<Asset> findByOrganizationId(UUID organizationId);

    List<Asset> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<Asset> findByOrganizationIdAndTypeAndNameContainingIgnoreCase(UUID organizationId, String type, String name, Pageable pageable);
    
    Page<Asset> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);
}
