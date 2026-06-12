package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.DocumentSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentSearchRepository extends ElasticsearchRepository<DocumentSearchDocument, String> {
    List<DocumentSearchDocument> findByOrganizationId(String organizationId);
    List<DocumentSearchDocument> findByTitleContainingOrContentContainingOrTagsContainingOrCategoryContaining(
        String title, String content, String tags, String category
    );
}
