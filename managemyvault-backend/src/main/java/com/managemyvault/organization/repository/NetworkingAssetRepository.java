package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.NetworkingAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NetworkingAssetRepository extends JpaRepository<NetworkingAsset, UUID> {

    List<NetworkingAsset> findByOrganizationId(UUID organizationId);

    List<NetworkingAsset> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<NetworkingAsset> findByOrganizationIdAndTypeAndNameContainingIgnoreCase(UUID organizationId, String type, String name, Pageable pageable);

    Page<NetworkingAsset> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);
}
