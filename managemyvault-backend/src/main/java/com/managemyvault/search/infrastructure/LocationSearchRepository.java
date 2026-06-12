package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.LocationSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationSearchRepository extends ElasticsearchRepository<LocationSearchDocument, String> {
    List<LocationSearchDocument> findByOrganizationId(String organizationId);
    List<LocationSearchDocument> findByNameContainingOrAddressContainingOrCityContainingOrNotesContaining(
        String name, String address, String city, String notes
    );
}
