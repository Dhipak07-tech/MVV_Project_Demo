package com.managemyvault.organization.search;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationSearchRepository extends ElasticsearchRepository<OrganizationSearchDocument, String> {
    List<OrganizationSearchDocument> findByNameContainingOrDescriptionContaining(String name, String description);
}
