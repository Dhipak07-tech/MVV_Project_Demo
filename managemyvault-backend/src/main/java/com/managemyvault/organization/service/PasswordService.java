package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.common.util.EncryptionUtils;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.domain.Password;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.repository.PasswordRepository;
import com.managemyvault.organization.web.dto.CreatePasswordRequest;
import com.managemyvault.organization.web.dto.PasswordResponse;
import com.managemyvault.organization.web.dto.UpdatePasswordRequest;
import com.managemyvault.search.domain.EntityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordService {

    private final PasswordRepository passwordRepository;
    private final OrganizationRepository organizationRepository;
    private final EncryptionUtils encryptionUtils;
    private final ApplicationEventPublisher eventPublisher;

    private Organization getOrganizationOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndDeletedFalse(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId.toString()));
    }

    @Transactional(readOnly = true)
    public Page<PasswordResponse> getPasswordsByOrgId(UUID orgId, String search, Pageable pageable) {
        getOrganizationOrThrow(orgId);
        Page<Password> page;
        if (search != null && !search.trim().isEmpty()) {
            page = passwordRepository.findByOrganizationIdAndNameContainingIgnoreCase(orgId, search, pageable);
        } else {
            page = passwordRepository.findByOrganizationId(orgId, pageable);
        }
        return page.map(pw -> {
            try {
                String decrypted = encryptionUtils.decrypt(pw.getPasswordEncrypted(), pw.getIv(), orgId);
                return PasswordResponse.from(pw, decrypted);
            } catch (Exception e) {
                log.error("Failed to decrypt password ID: {}", pw.getId(), e);
                return PasswordResponse.from(pw, "[DECRYPTION FAILURE]");
            }
        });
    }

    @Transactional(readOnly = true)
    public PasswordResponse getPasswordById(UUID orgId, UUID passwordId) {
        getOrganizationOrThrow(orgId);
        Password pw = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new ResourceNotFoundException("Password", passwordId.toString()));
        if (!pw.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Password does not belong to the specified organization");
        }
        String decrypted = encryptionUtils.decrypt(pw.getPasswordEncrypted(), pw.getIv(), orgId);
        return PasswordResponse.from(pw, decrypted);
    }

    @Transactional
    public PasswordResponse createPassword(UUID orgId, CreatePasswordRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);

        EncryptionUtils.EncryptedData encrypted = encryptionUtils.encrypt(request.getPassword(), orgId);

        Password pw = Password.builder()
                .organizationId(orgId)
                .name(request.getName())
                .username(request.getUsername())
                .passwordEncrypted(encrypted.ciphertext)
                .iv(encrypted.iv)
                .url(request.getUrl())
                .otpSecret(request.getOtpSecret())
                .notes(request.getNotes())
                .strength(request.getStrength())
                .build();

        pw.setCreatedBy(currentUser.getId());
        Password saved = passwordRepository.save(pw);
        log.info("Password created: {} for organization {}", saved.getName(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.CREATE, saved.getId().toString(), "PASSWORD", orgId.toString(), saved));
        return PasswordResponse.from(saved, request.getPassword());
    }

    @Transactional
    public PasswordResponse updatePassword(UUID orgId, UUID passwordId, UpdatePasswordRequest request, UserPrincipal currentUser) {
        getOrganizationOrThrow(orgId);
        Password pw = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new ResourceNotFoundException("Password", passwordId.toString()));
        if (!pw.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Password does not belong to the specified organization");
        }

        if (request.getName() != null) pw.setName(request.getName());
        if (request.getUsername() != null) pw.setUsername(request.getUsername());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            EncryptionUtils.EncryptedData encrypted = encryptionUtils.encrypt(request.getPassword(), orgId);
            pw.setPasswordEncrypted(encrypted.ciphertext);
            pw.setIv(encrypted.iv);
        }

        if (request.getUrl() != null) pw.setUrl(request.getUrl());
        if (request.getOtpSecret() != null) pw.setOtpSecret(request.getOtpSecret());
        if (request.getNotes() != null) pw.setNotes(request.getNotes());
        if (request.getStrength() != null) pw.setStrength(request.getStrength());

        pw.setUpdatedBy(currentUser.getId());
        Password saved = passwordRepository.save(pw);
        log.info("Password updated: {} for organization {}", saved.getName(), orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.UPDATE, saved.getId().toString(), "PASSWORD", orgId.toString(), saved));

        String decrypted = encryptionUtils.decrypt(saved.getPasswordEncrypted(), saved.getIv(), orgId);
        return PasswordResponse.from(saved, decrypted);
    }

    @Transactional
    public void deletePassword(UUID orgId, UUID passwordId) {
        getOrganizationOrThrow(orgId);
        Password pw = passwordRepository.findById(passwordId)
                .orElseThrow(() -> new ResourceNotFoundException("Password", passwordId.toString()));
        if (!pw.getOrganizationId().equals(orgId)) {
            throw new IllegalArgumentException("Password does not belong to the specified organization");
        }
        passwordRepository.delete(pw);
        log.info("Password deleted: {} from organization {}", passwordId, orgId);
        eventPublisher.publishEvent(new EntityEvent<>(EntityEvent.Action.DELETE, passwordId.toString(), "PASSWORD", orgId.toString(), null));
    }
}
