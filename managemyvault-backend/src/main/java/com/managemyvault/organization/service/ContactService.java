package com.managemyvault.organization.service;

import com.managemyvault.common.exception.ResourceNotFoundException;
import com.managemyvault.organization.domain.Contact;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.ContactRepository;
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
public class ContactService {

    private final ContactRepository contactRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityEventService activityEventService;
    private final RevisionService revisionService;

    @Transactional(readOnly = true)
    public List<Contact> getByOrganizationId(UUID organizationId) {
        return contactRepository.findByOrganizationId(organizationId);
    }

    @Transactional(readOnly = true)
    public Contact getById(UUID id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id.toString()));
    }

    @Transactional(readOnly = true)
    public List<Contact> search(UUID organizationId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return contactRepository.findByOrganizationId(organizationId);
        }
        return contactRepository.searchContacts(organizationId, query.trim());
    }

    @Transactional
    public Contact create(UUID organizationId, Contact contact, UUID userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        contact.setOrganization(organization);
        contact.setCreatedBy(userId);
        if (contact.getIsActive() == null) {
            contact.setIsActive(true);
        }
        if (contact.getPrimaryContact() == null) contact.setPrimaryContact(false);
        if (contact.getEmergencyContact() == null) contact.setEmergencyContact(false);
        if (contact.getAuthorizationContact() == null) contact.setAuthorizationContact(false);

        // PrePersist updateFullName is handled inside the entity class
        Contact saved = contactRepository.save(contact);

        activityEventService.logEvent(organizationId, "Contact", saved.getId(), "CREATE", userId);
        revisionService.saveRevision("Contact", saved.getId(), null, saved, userId);

        return saved;
    }

    @Transactional
    public Contact update(UUID id, Contact updated, UUID userId) {
        Contact existing = getById(id);

        // Save a deep clone for revision diff comparison
        Contact before = Contact.builder()
                .id(existing.getId())
                .organization(existing.getOrganization())
                .name(existing.getName())
                .firstName(existing.getFirstName())
                .lastName(existing.getLastName())
                .role(existing.getRole())
                .email(existing.getEmail())
                .phone(existing.getPhone())
                .mobile(existing.getMobile())
                .department(existing.getDepartment())
                .primaryContact(existing.getPrimaryContact())
                .emergencyContact(existing.getEmergencyContact())
                .authorizationContact(existing.getAuthorizationContact())
                .notes(existing.getNotes())
                .isActive(existing.getIsActive())
                .build();
        before.setVersion(existing.getVersion());

        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setRole(updated.getRole());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setMobile(updated.getMobile());
        existing.setDepartment(updated.getDepartment());
        existing.setPrimaryContact(updated.getPrimaryContact());
        existing.setEmergencyContact(updated.getEmergencyContact());
        existing.setAuthorizationContact(updated.getAuthorizationContact());
        existing.setNotes(updated.getNotes());
        existing.setIsActive(updated.getIsActive());
        existing.setUpdatedBy(userId);

        // pre-persist / pre-update hook will auto-compute the name
        Contact saved = contactRepository.save(existing);

        activityEventService.logEvent(saved.getOrganization().getId(), "Contact", saved.getId(), "UPDATE", userId);
        revisionService.saveRevision("Contact", saved.getId(), before, saved, userId);

        return saved;
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Contact existing = getById(id);

        revisionService.saveRevision("Contact", existing.getId(), existing, null, userId);
        activityEventService.logEvent(existing.getOrganization().getId(), "Contact", existing.getId(), "DELETE", userId);

        contactRepository.delete(existing);
    }
}
