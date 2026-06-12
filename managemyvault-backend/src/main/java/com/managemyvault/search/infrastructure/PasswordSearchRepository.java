package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.PasswordSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PasswordSearchRepository extends ElasticsearchRepository<PasswordSearchDocument, String> {
    List<PasswordSearchDocument> findByOrganizationId(String organizationId);
    List<PasswordSearchDocument> findByTitleContainingOrUsernameContainingOrUrlContainingOrNotesContaining(
        String title, String username, String url, String notes
    );
}
