package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.ActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityEventRepository extends JpaRepository<ActivityEvent, UUID> {
    List<ActivityEvent> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, UUID entityId);
}
