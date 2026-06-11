package com.managemyvault.organization.repository;

import com.managemyvault.organization.domain.OrganizationMember;
import com.managemyvault.organization.domain.OrgRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {

    Optional<OrganizationMember> findByOrganizationIdAndEmail(UUID organizationId, String email);

    boolean existsByOrganizationIdAndEmail(UUID organizationId, String email);

    Page<OrganizationMember> findByOrganizationId(UUID organizationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM OrganizationMember m WHERE m.organizationId = :orgId")
    long countByOrganizationId(@Param("orgId") UUID organizationId);

    @Query("SELECT COUNT(m) FROM OrganizationMember m WHERE m.organizationId = :orgId AND m.orgRole = :role")
    long countByOrganizationIdAndRole(@Param("orgId") UUID organizationId, @Param("role") OrgRole role);
}
