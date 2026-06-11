package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.OrganizationStatus;
import com.managemyvault.organization.repository.OrganizationMemberRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.web.dto.CreateOrganizationRequest;
import com.managemyvault.organization.web.dto.OrganizationResponse;
import com.managemyvault.organization.web.dto.UpdateOrganizationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Organization business logic service.
 * Owns transaction boundaries per CONSTRAINT-008.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final OrganizationSlugGenerator slugGenerator;

    /**
     * Create a new organization.
     */
    @Transactional
    @CacheEvict(value = "organizations", allEntries = true)
    public OrganizationResponse create(CreateOrganizationRequest request, UserPrincipal currentUser) {
        String slug = slugGenerator.generateUniqueSlug(request.getName());

        Organization org = Organization.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .website(request.getWebsite())
                .phone(request.getPhone())
                .email(request.getEmail())
                .status(OrganizationStatus.ACTIVE)
                .healthScore(100)
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .countryCode(request.getCountryCode())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .stateProvince(request.getStateProvince())
                .postalCode(request.getPostalCode())
                .build();

        // Set audit fields manually since we need the user ID
        org.setCreatedBy(currentUser.getId());

        Organization saved = organizationRepository.save(org);
        log.info("Organization created: {} ({})", saved.getName(), saved.getSlug());

        return OrganizationResponse.from(saved);
    }

    /**
     * Update an existing organization.
     */
    @Transactional
    @CacheEvict(value = "organizations", allEntries = true)
    public OrganizationResponse update(UUID organizationId, UpdateOrganizationRequest request,
                                        UserPrincipal currentUser) {
        Organization org = findOrThrow(organizationId);

        if (request.getName() != null) org.setName(request.getName());
        if (request.getDescription() != null) org.setDescription(request.getDescription());
        if (request.getIndustry() != null) org.setIndustry(request.getIndustry());
        if (request.getCompanySize() != null) org.setCompanySize(request.getCompanySize());
        if (request.getWebsite() != null) org.setWebsite(request.getWebsite());
        if (request.getPhone() != null) org.setPhone(request.getPhone());
        if (request.getEmail() != null) org.setEmail(request.getEmail());
        if (request.getTimezone() != null) org.setTimezone(request.getTimezone());
        if (request.getCountryCode() != null) org.setCountryCode(request.getCountryCode());
        if (request.getAddressLine1() != null) org.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) org.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) org.setCity(request.getCity());
        if (request.getStateProvince() != null) org.setStateProvince(request.getStateProvince());
        if (request.getPostalCode() != null) org.setPostalCode(request.getPostalCode());

        org.setUpdatedBy(currentUser.getId());

        Organization saved = organizationRepository.save(org);
        enrichWithStats(saved);

        log.info("Organization updated: {} by user {}", saved.getName(), currentUser.getEmail());
        return OrganizationResponse.from(saved);
    }

    /**
     * Soft-archive an organization.
     */
    @Transactional
    @CacheEvict(value = "organizations", allEntries = true)
    public void archive(UUID organizationId, UserPrincipal currentUser) {
        Organization org = findOrThrow(organizationId);
        org.setStatus(OrganizationStatus.ARCHIVED);
        org.setDeleted(true);
        org.setDeletedAt(Instant.now());
        org.setDeletedBy(currentUser.getId());
        organizationRepository.save(org);
        log.info("Organization archived: {} by user {}", org.getName(), currentUser.getEmail());
    }

    /**
     * Restore an archived organization.
     */
    @Transactional
    @CacheEvict(value = "organizations", allEntries = true)
    public OrganizationResponse restore(UUID organizationId, UserPrincipal currentUser) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));
        org.setStatus(OrganizationStatus.ACTIVE);
        org.setDeleted(false);
        org.setDeletedAt(null);
        org.setDeletedBy(null);
        Organization saved = organizationRepository.save(org);
        log.info("Organization restored: {} by user {}", saved.getName(), currentUser.getEmail());
        return OrganizationResponse.from(saved);
    }

    private Organization findOrThrow(UUID id) {
        return organizationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id.toString()));
    }

    private void enrichWithStats(Organization org) {
        org.setMemberCount(memberRepository.countByOrganizationId(org.getId()));
    }
}
