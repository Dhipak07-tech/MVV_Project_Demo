package com.managemyvault.organization.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.OrgAccessControl;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Contact;
import com.managemyvault.organization.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Validated
public class ContactController {

    private final ContactService contactService;
    private final OrgAccessControl orgAccessControl;

    @GetMapping
    public ResponseEntity<List<Contact>> getByOrganization(
            @RequestParam("organizationId") UUID organizationId,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(contactService.getByOrganizationId(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getById(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Contact contact = contactService.getById(id);
        if (!orgAccessControl.canAccess(contact.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<Contact> create(
            @RequestParam("organizationId") UUID organizationId,
            @RequestBody Contact contact,
            @CurrentUser UserPrincipal currentUser) {
        if (!orgAccessControl.canAccess(organizationId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(contactService.create(organizationId, contact, currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> update(
            @PathVariable("id") UUID id,
            @RequestBody Contact contact,
            @CurrentUser UserPrincipal currentUser) {
        Contact existing = contactService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(contactService.update(id, contact, currentUser.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable("id") UUID id,
            @CurrentUser UserPrincipal currentUser) {
        Contact existing = contactService.getById(id);
        if (!orgAccessControl.canAccess(existing.getOrganization().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        contactService.delete(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
