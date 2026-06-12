package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Tracker;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrackerRepository extends JpaRepository<Tracker, UUID> {

    List<Tracker> findByOrganizationIdAndType(UUID organizationId, String type);

    Page<Tracker> findByOrganizationIdAndType(UUID organizationId, String type, Pageable pageable);

    Page<Tracker> findByOrganizationIdAndTypeAndNameContainingIgnoreCase(
            UUID organizationId, String type, String name, Pageable pageable);
}
