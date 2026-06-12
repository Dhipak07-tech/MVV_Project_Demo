package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.AssetSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetSearchRepository extends ElasticsearchRepository<AssetSearchDocument, String> {
    List<AssetSearchDocument> findByOrganizationId(String organizationId);
    List<AssetSearchDocument> findByNameContainingOrHostnameContainingOrIpAddressContainingOrSerialNumberContainingOrNotesContaining(
        String name, String hostname, String ipAddress, String serialNumber, String notes
    );
}
