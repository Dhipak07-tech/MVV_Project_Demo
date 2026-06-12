package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Location;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.LocationRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final LocationRepository locationRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    @Transactional(readOnly = true)
    public List<Location> getByOrganizationId(UUID organizationId) {
        return locationRepository.findByOrganizationId(organizationId);
    }

    @Transactional(readOnly = true)
    public Location getById(UUID id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id.toString()));
    }

    @Transactional
    public Location create(UUID organizationId, Location location, UUID userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        location.setOrganization(organization);
        location.setCreatedBy(userId);
        if (location.getPrimaryLocation() == null) {
            location.setPrimaryLocation(false);
        }

        Location saved = locationRepository.save(location);

        activityEventService.logEvent(organizationId, "Location", saved.getId(), "CREATE", userId);
        revisionService.saveRevision("Location", saved.getId(), null, saved, userId);

        return saved;
    }

    @Transactional
    public Location update(UUID id, Location updated, UUID userId) {
        Location existing = getById(id);

        Location before = Location.builder()
                .id(existing.getId())
                .organization(existing.getOrganization())
                .name(existing.getName())
                .address(existing.getAddress())
                .type(existing.getType())
                .notes(existing.getNotes())
                .city(existing.getCity())
                .country(existing.getCountry())
                .state(existing.getState())
                .zip(existing.getZip())
                .phone(existing.getPhone())
                .timezone(existing.getTimezone())
                .primaryLocation(existing.getPrimaryLocation())
                .build();
        before.setVersion(existing.getVersion());

        existing.setName(updated.getName());
        existing.setAddress(updated.getAddress());
        existing.setType(updated.getType());
        existing.setNotes(updated.getNotes());
        existing.setCity(updated.getCity());
        existing.setCountry(updated.getCountry());
        existing.setState(updated.getState());
        existing.setZip(updated.getZip());
        existing.setPhone(updated.getPhone());
        existing.setTimezone(updated.getTimezone());
        existing.setPrimaryLocation(updated.getPrimaryLocation());
        existing.setUpdatedBy(userId);

        Location saved = locationRepository.save(existing);

        activityEventService.logEvent(saved.getOrganization().getId(), "Location", saved.getId(), "UPDATE", userId);
        revisionService.saveRevision("Location", saved.getId(), before, saved, userId);

        return saved;
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Location existing = getById(id);

        revisionService.saveRevision("Location", existing.getId(), existing, null, userId);
        activityEventService.logEvent(existing.getOrganization().getId(), "Location", existing.getId(), "DELETE", userId);

        locationRepository.delete(existing);
    }
}
