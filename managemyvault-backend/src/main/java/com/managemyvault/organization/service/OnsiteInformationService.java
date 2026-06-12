package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.OnsiteInformation;
import com.managemyvault.organization.repository.OnsiteInformationRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OnsiteInformationService {

    private final OnsiteInformationRepository onsiteInformationRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    private void validateOrganization(UUID orgId) {
        organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional
    public OnsiteInformation getOrCreate(UUID organizationId, UUID userId) {
        validateOrganization(organizationId);
        return onsiteInformationRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    OnsiteInformation info = OnsiteInformation.builder()
                            .organizationId(organizationId)
                            .build();
                    info.setCreatedBy(userId);
                    OnsiteInformation saved = onsiteInformationRepository.save(info);
                    activityEventService.logEvent(organizationId, "OnsiteInformation", organizationId, "CREATE", userId);
                    return saved;
                });
    }

    @Transactional
    public OnsiteInformation update(UUID organizationId, OnsiteInformation updateData, UUID userId) {
        OnsiteInformation existing = getOrCreate(organizationId, userId);

        OnsiteInformation beforeState = OnsiteInformation.builder()
                .organizationId(existing.getOrganizationId())
                .parkingInstructions(existing.getParkingInstructions())
                .buildingAccess(existing.getBuildingAccess())
                .serverRoomAccess(existing.getServerRoomAccess())
                .wifiInformation(existing.getWifiInformation())
                .keyLocations(existing.getKeyLocations())
                .notes(existing.getNotes())
                .build();
        beforeState.setCreatedAt(existing.getCreatedAt());
        beforeState.setCreatedBy(existing.getCreatedBy());
        beforeState.setUpdatedAt(existing.getUpdatedAt());
        beforeState.setUpdatedBy(existing.getUpdatedBy());

        if (updateData.getParkingInstructions() != null) existing.setParkingInstructions(updateData.getParkingInstructions());
        if (updateData.getBuildingAccess() != null) existing.setBuildingAccess(updateData.getBuildingAccess());
        if (updateData.getServerRoomAccess() != null) existing.setServerRoomAccess(updateData.getServerRoomAccess());
        if (updateData.getWifiInformation() != null) existing.setWifiInformation(updateData.getWifiInformation());
        if (updateData.getKeyLocations() != null) existing.setKeyLocations(updateData.getKeyLocations());
        if (updateData.getNotes() != null) existing.setNotes(updateData.getNotes());

        existing.setUpdatedBy(userId);
        OnsiteInformation saved = onsiteInformationRepository.save(existing);

        activityEventService.logEvent(organizationId, "OnsiteInformation", organizationId, "UPDATE", userId);
        revisionService.saveRevision("OnsiteInformation", organizationId, beforeState, saved, userId);

        return saved;
    }
}
