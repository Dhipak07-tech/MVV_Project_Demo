package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByOrganizationId(UUID organizationId);

    @Query("SELECT c FROM Contact c WHERE c.organization.id = :orgId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.phone) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.department) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Contact> searchContacts(@Param("orgId") UUID orgId, @Param("query") String query);
}
