package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.AfterHoursInformation;
import com.managemyvault.organization.repository.AfterHoursInformationRepository;
import com.managemyvault.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AfterHoursService {

    private final AfterHoursInformationRepository afterHoursInformationRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    private void validateOrganization(UUID orgId) {
        organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional
    public AfterHoursInformation getOrCreate(UUID organizationId, UUID userId) {
        validateOrganization(organizationId);
        return afterHoursInformationRepository.findByOrganizationId(organizationId)
                .orElseGet(() -> {
                    AfterHoursInformation info = AfterHoursInformation.builder()
                            .organizationId(organizationId)
                            .build();
                    info.setCreatedBy(userId);
                    AfterHoursInformation saved = afterHoursInformationRepository.save(info);
                    activityEventService.logEvent(organizationId, "AfterHoursInformation", organizationId, "CREATE", userId);
                    return saved;
                });
    }

    @Transactional
    public AfterHoursInformation update(UUID organizationId, AfterHoursInformation updateData, UUID userId) {
        AfterHoursInformation existing = getOrCreate(organizationId, userId);

        AfterHoursInformation beforeState = AfterHoursInformation.builder()
                .organizationId(existing.getOrganizationId())
                .alarmCodes(existing.getAlarmCodes())
                .afterHoursProcedure(existing.getAfterHoursProcedure())
                .emergencyPhone(existing.getEmergencyPhone())
                .escalationProcedure(existing.getEscalationProcedure())
                .securityVendor(existing.getSecurityVendor())
                .notes(existing.getNotes())
                .build();
        beforeState.setCreatedAt(existing.getCreatedAt());
        beforeState.setCreatedBy(existing.getCreatedBy());
        beforeState.setUpdatedAt(existing.getUpdatedAt());
        beforeState.setUpdatedBy(existing.getUpdatedBy());

        if (updateData.getAlarmCodes() != null) existing.setAlarmCodes(updateData.getAlarmCodes());
        if (updateData.getAfterHoursProcedure() != null) existing.setAfterHoursProcedure(updateData.getAfterHoursProcedure());
        if (updateData.getEmergencyPhone() != null) existing.setEmergencyPhone(updateData.getEmergencyPhone());
        if (updateData.getEscalationProcedure() != null) existing.setEscalationProcedure(updateData.getEscalationProcedure());
        if (updateData.getSecurityVendor() != null) existing.setSecurityVendor(updateData.getSecurityVendor());
        if (updateData.getNotes() != null) existing.setNotes(updateData.getNotes());

        existing.setUpdatedBy(userId);
        AfterHoursInformation saved = afterHoursInformationRepository.save(existing);

        activityEventService.logEvent(organizationId, "AfterHoursInformation", organizationId, "UPDATE", userId);
        revisionService.saveRevision("AfterHoursInformation", organizationId, beforeState, saved, userId);

        return saved;
    }
}
