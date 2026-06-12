package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.ContactSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactSearchRepository extends ElasticsearchRepository<ContactSearchDocument, String> {
    List<ContactSearchDocument> findByOrganizationId(String organizationId);
    List<ContactSearchDocument> findByFirstNameContainingOrLastNameContainingOrEmailContainingOrPhoneContainingOrRoleContainingOrNotesContaining(
        String firstName, String lastName, String email, String phone, String role, String notes
    );
}
