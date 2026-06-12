package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.ApplicationSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationSearchRepository extends ElasticsearchRepository<ApplicationSearchDocument, String> {
    List<ApplicationSearchDocument> findByOrganizationId(String organizationId);
    List<ApplicationSearchDocument> findByNameContainingOrVendorContainingOrCategoryContainingOrDescriptionContaining(
        String name, String vendor, String category, String description
    );
}
