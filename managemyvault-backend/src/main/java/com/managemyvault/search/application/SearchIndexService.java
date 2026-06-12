package com.managemyvault.search.application;

import com.managemyvault.organization.domain.*;
import com.managemyvault.organization.repository.*;
import com.managemyvault.search.domain.*;
import com.managemyvault.search.infrastructure.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchIndexService {

    // JPA Repositories to load data for reindexing
    private final OrganizationRepository organizationRepository;
    private final ContactRepository contactRepository;
    private final LocationRepository locationRepository;
    private final AssetRepository assetRepository;
    private final DocumentRepository documentRepository;
    private final PasswordRepository passwordRepository;
    private final AppServiceRepository appServiceRepository;

    // Search Repositories
    private final ContactSearchRepository contactSearchRepository;
    private final LocationSearchRepository locationSearchRepository;
    private final AssetSearchRepository assetSearchRepository;
    private final DocumentSearchRepository documentSearchRepository;
    private final PasswordSearchRepository passwordSearchRepository;
    private final ApplicationSearchRepository applicationSearchRepository;

    @EventListener
    @Async
    public void handleEntityEvent(EntityEvent<?> event) {
        log.info("Received search index sync event: {} for {} (ID: {})", 
                event.getAction(), event.getEntityType(), event.getEntityId());
        try {
            switch (event.getEntityType().toUpperCase()) {
                case "CONTACT" -> handleContactEvent((EntityEvent<Contact>) event);
                case "LOCATION" -> handleLocationEvent((EntityEvent<Location>) event);
                case "ASSET" -> handleAssetEvent((EntityEvent<Asset>) event);
                case "DOCUMENT" -> handleDocumentEvent((EntityEvent<Document>) event);
                case "PASSWORD" -> handlePasswordEvent((EntityEvent<Password>) event);
                case "APPLICATION" -> handleApplicationEvent((EntityEvent<AppService>) event);
                default -> log.warn("Unsupported entity type for search indexing: {}", event.getEntityType());
            }
        } catch (Exception e) {
            log.error("Failed to process search index event for {} {}: {}", 
                    event.getEntityType(), event.getEntityId(), e.getMessage(), e);
        }
    }

    private void handleContactEvent(EntityEvent<Contact> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            contactSearchRepository.deleteById(event.getEntityId());
        } else {
            Contact contact = event.getEntity();
            // Split name into first/last name
            String first = "";
            String last = "";
            if (contact.getName() != null) {
                String[] parts = contact.getName().trim().split("\\s+", 2);
                first = parts[0];
                if (parts.length > 1) {
                    last = parts[1];
                }
            }
            ContactSearchDocument doc = ContactSearchDocument.builder()
                    .id(contact.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .firstName(first)
                    .lastName(last)
                    .email(contact.getEmail())
                    .phone(contact.getPhone())
                    .role(contact.getRole()) // Map role to role field
                    .notes("")
                    .build();
            contactSearchRepository.save(doc);
        }
    }

    private void handleLocationEvent(EntityEvent<Location> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            locationSearchRepository.deleteById(event.getEntityId());
        } else {
            Location loc = event.getEntity();
            LocationSearchDocument doc = LocationSearchDocument.builder()
                    .id(loc.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .name(loc.getName())
                    .address(loc.getAddress())
                    .city(loc.getCity())
                    .country(loc.getCountry())
                    .notes(loc.getNotes())
                    .build();
            locationSearchRepository.save(doc);
        }
    }

    private void handleAssetEvent(EntityEvent<Asset> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            assetSearchRepository.deleteById(event.getEntityId());
        } else {
            Asset asset = event.getEntity();
            AssetSearchDocument doc = AssetSearchDocument.builder()
                    .id(asset.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .name(asset.getName())
                    .assetType(asset.getType())
                    .hostname("")
                    .ipAddress(asset.getIpAddress())
                    .serialNumber(asset.getSerialNumber())
                    .vendor(asset.getManufacturer())
                    .notes(asset.getNotes())
                    .build();
            assetSearchRepository.save(doc);
        }
    }

    private void handleDocumentEvent(EntityEvent<Document> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            documentSearchRepository.deleteById(event.getEntityId());
        } else {
            Document doc = event.getEntity();
            DocumentSearchDocument searchDoc = DocumentSearchDocument.builder()
                    .id(doc.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .title(doc.getTitle())
                    .content(doc.getContent())
                    .tags("")
                    .category(doc.getCategory())
                    .build();
            documentSearchRepository.save(searchDoc);
        }
    }

    private void handlePasswordEvent(EntityEvent<Password> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            passwordSearchRepository.deleteById(event.getEntityId());
        } else {
            Password pwd = event.getEntity();
            PasswordSearchDocument doc = PasswordSearchDocument.builder()
                    .id(pwd.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .title(pwd.getName()) // Password uses name field for title
                    .username(pwd.getUsername())
                    .url(pwd.getUrl())
                    .tags("")
                    .notes(pwd.getNotes())
                    .build();
            passwordSearchRepository.save(doc);
        }
    }

    private void handleApplicationEvent(EntityEvent<AppService> event) {
        if (event.getAction() == EntityEvent.Action.DELETE) {
            applicationSearchRepository.deleteById(event.getEntityId());
        } else {
            AppService app = event.getEntity();
            ApplicationSearchDocument doc = ApplicationSearchDocument.builder()
                    .id(app.getId().toString())
                    .organizationId(event.getOrganizationId())
                    .name(app.getName())
                    .vendor(app.getProvider())
                    .category(app.getType())
                    .description(app.getNotes())
                    .build();
            applicationSearchRepository.save(doc);
        }
    }

    public void reindexAll() {
        log.info("Starting complete search index reindexing...");

        // 1. Reindex Contacts
        contactSearchRepository.deleteAll();
        contactRepository.findAll().forEach(contact -> {
            String first = "";
            String last = "";
            if (contact.getName() != null) {
                String[] parts = contact.getName().trim().split("\\s+", 2);
                first = parts[0];
                if (parts.length > 1) {
                    last = parts[1];
                }
            }
            ContactSearchDocument doc = ContactSearchDocument.builder()
                    .id(contact.getId().toString())
                    .organizationId(contact.getOrganization().getId().toString())
                    .firstName(first)
                    .lastName(last)
                    .email(contact.getEmail())
                    .phone(contact.getPhone())
                    .role(contact.getRole())
                    .notes("")
                    .build();
            contactSearchRepository.save(doc);
        });

        // 2. Reindex Locations
        locationSearchRepository.deleteAll();
        locationRepository.findAll().forEach(loc -> {
            LocationSearchDocument doc = LocationSearchDocument.builder()
                    .id(loc.getId().toString())
                    .organizationId(loc.getOrganization().getId().toString())
                    .name(loc.getName())
                    .address(loc.getAddress())
                    .city(loc.getCity())
                    .country(loc.getCountry())
                    .notes(loc.getNotes())
                    .build();
            locationSearchRepository.save(doc);
        });

        // 3. Reindex Assets
        assetSearchRepository.deleteAll();
        assetRepository.findAll().forEach(asset -> {
            AssetSearchDocument doc = AssetSearchDocument.builder()
                    .id(asset.getId().toString())
                    .organizationId(asset.getOrganizationId().toString())
                    .name(asset.getName())
                    .assetType(asset.getType())
                    .hostname("")
                    .ipAddress(asset.getIpAddress())
                    .serialNumber(asset.getSerialNumber())
                    .vendor(asset.getManufacturer())
                    .notes(asset.getNotes())
                    .build();
            assetSearchRepository.save(doc);
        });

        // 4. Reindex Documents
        documentSearchRepository.deleteAll();
        documentRepository.findAll().forEach(doc -> {
            DocumentSearchDocument searchDoc = DocumentSearchDocument.builder()
                    .id(doc.getId().toString())
                    .organizationId(doc.getOrganizationId().toString())
                    .title(doc.getTitle())
                    .content(doc.getContent())
                    .tags("")
                    .category(doc.getCategory())
                    .build();
            documentSearchRepository.save(searchDoc);
        });

        // 5. Reindex Passwords
        passwordSearchRepository.deleteAll();
        passwordRepository.findAll().forEach(pwd -> {
            PasswordSearchDocument doc = PasswordSearchDocument.builder()
                    .id(pwd.getId().toString())
                    .organizationId(pwd.getOrganizationId().toString())
                    .title(pwd.getName())
                    .username(pwd.getUsername())
                    .url(pwd.getUrl())
                    .tags("")
                    .notes(pwd.getNotes())
                    .build();
            passwordSearchRepository.save(doc);
        });

        // 6. Reindex Applications
        applicationSearchRepository.deleteAll();
        appServiceRepository.findAll().forEach(app -> {
            ApplicationSearchDocument doc = ApplicationSearchDocument.builder()
                    .id(app.getId().toString())
                    .organizationId(app.getOrganizationId().toString())
                    .name(app.getName())
                    .vendor(app.getProvider())
                    .category(app.getType())
                    .description(app.getNotes())
                    .build();
            applicationSearchRepository.save(doc);
        });

        log.info("Reindexing completed successfully.");
    }
}
