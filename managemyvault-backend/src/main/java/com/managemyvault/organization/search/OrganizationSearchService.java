package com.managemyvault.organization.search;

import com.managemyvault.organization.domain.Organization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationSearchService {

    private final OrganizationSearchRepository searchRepository;

    /**
     * Index or update an organization in Elasticsearch.
     */
    public void indexOrganization(Organization org) {
        try {
            OrganizationSearchDocument doc = OrganizationSearchDocument.builder()
                    .id(org.getId().toString())
                    .name(org.getName())
                    .slug(org.getSlug())
                    .description(org.getDescription())
                    .industry(org.getIndustry())
                    .status(org.getStatus().name())
                    .build();
            searchRepository.save(doc);
            log.info("Successfully indexed organization in Elasticsearch: {}", org.getName());
        } catch (Exception e) {
            log.error("Failed to index organization {} in Elasticsearch: {}", org.getId(), e.getMessage());
        }
    }

    /**
     * Delete an organization from Elasticsearch.
     */
    public void deleteOrganization(String id) {
        try {
            searchRepository.deleteById(id);
            log.info("Successfully deleted organization from Elasticsearch: {}", id);
        } catch (Exception e) {
            log.error("Failed to delete organization {} from Elasticsearch: {}", id, e.getMessage());
        }
    }

    /**
     * Global search for organizations across all indices.
     */
    public List<OrganizationSearchDocument> searchOrganizations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return searchRepository.findByNameContainingOrDescriptionContaining(query, query);
        } catch (Exception e) {
            log.error("Failed to perform global search for query '{}': {}", query, e.getMessage());
            return Collections.emptyList();
        }
    }
}
