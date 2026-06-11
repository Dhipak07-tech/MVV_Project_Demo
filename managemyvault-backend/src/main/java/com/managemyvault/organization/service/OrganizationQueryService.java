package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.OrganizationStatus;
import com.managemyvault.organization.repository.OrganizationMemberRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.OrganizationResponse;
import com.managemyvault.organization.web.dto.OrganizationSummaryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Read-only query service for organizations.
 * Separated from write service for CQRS clarity.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrganizationQueryService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;

    /**
     * Search/list organizations with filters and pagination.
     */
    public Page<OrganizationSummaryResponse> findAll(String search, OrganizationStatus status,
                                                      String industry, Pageable pageable) {
        Page<Organization> page = organizationRepository.searchOrganizations(
                search, status, industry, pageable
        );

        return page.map(org -> {
            org.setMemberCount(memberRepository.countByOrganizationId(org.getId()));
            return OrganizationSummaryResponse.from(org);
        });
    }

    /**
     * Get a single organization by ID with full details.
     */
    @Cacheable(value = "organizations", key = "#organizationId")
    public OrganizationResponse findById(UUID organizationId) {
        Organization org = organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        // Enrich with stats
        org.setMemberCount(memberRepository.countByOrganizationId(org.getId()));

        return OrganizationResponse.from(org);
    }

    /**
     * Get organization by slug.
     */
    public OrganizationResponse findBySlug(String slug) {
        Organization org = organizationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", slug));

        org.setMemberCount(memberRepository.countByOrganizationId(org.getId()));

        return OrganizationResponse.from(org);
    }

    /**
     * Get platform-wide organization statistics.
     */
    public OrganizationStats getStats() {
        return new OrganizationStats(
                organizationRepository.countActive(),
                organizationRepository.countByStatus(OrganizationStatus.ACTIVE),
                organizationRepository.countByStatus(OrganizationStatus.SUSPENDED),
                organizationRepository.countByStatus(OrganizationStatus.ARCHIVED)
        );
    }

    public record OrganizationStats(
            long total,
            long active,
            long suspended,
            long archived
    ) {}
}
