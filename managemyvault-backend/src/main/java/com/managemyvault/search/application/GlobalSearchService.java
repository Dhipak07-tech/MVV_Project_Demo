package com.managemyvault.search.application;

import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.organization.domain.Organization;
import com.managemyvault.organization.repository.OrganizationRepository;
import com.managemyvault.organization.search.*;
import com.managemyvault.search.domain.*;
import com.managemyvault.search.infrastructure.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GlobalSearchService {

    private final OrganizationRepository organizationRepository;

    private final OrganizationSearchRepository organizationSearchRepository;
    private final ContactSearchRepository contactSearchRepository;
    private final LocationSearchRepository locationSearchRepository;
    private final AssetSearchRepository assetSearchRepository;
    private final DocumentSearchRepository documentSearchRepository;
    private final PasswordSearchRepository passwordSearchRepository;
    private final ApplicationSearchRepository applicationSearchRepository;

    private final SearchLogRepository searchLogRepository;

    @Data
    @Builder
    public static class SearchResult {
        private String type;
        private String id;
        private String title;
        private String description;
        private String organization;
        private String organizationId;
        private String lastUpdated;
        private double score;
    }

    private Set<String> getUserOrganizationIds(UserPrincipal user) {
        if (user.isPlatformUser()) {
            return organizationRepository.findAll().stream()
                    .map(Organization::getId)
                    .map(UUID::toString)
                    .collect(Collectors.toSet());
        }
        if (user.getOrganizationId() != null) {
            return Set.of(user.getOrganizationId().toString());
        }
        return Collections.emptySet();
    }

    public List<SearchResult> search(String query, String entityType, String filterOrgId, UserPrincipal user) {
        long startTime = System.currentTimeMillis();
        if (query == null) {
            query = "";
        }
        query = query.trim();

        // 1. Get user's authorized organization IDs
        Set<String> authorizedOrgIds = getUserOrganizationIds(user);
        if (filterOrgId != null && !filterOrgId.trim().isEmpty()) {
            // Apply organization filter if specified, but verify user is authorized for it
            if (authorizedOrgIds.contains(filterOrgId)) {
                authorizedOrgIds = Set.of(filterOrgId);
            } else {
                authorizedOrgIds = Collections.emptySet();
            }
        }

        List<SearchResult> results = new ArrayList<>();
        if (authorizedOrgIds.isEmpty()) {
            return results;
        }

        String searchLower = query.toLowerCase();

        // 2. Query each search index depending on the entityType filter
        boolean searchAll = (entityType == null || entityType.trim().isEmpty() || entityType.equalsIgnoreCase("ALL"));

        // A. Organizations Index
        if (searchAll || entityType.equalsIgnoreCase("ORGANIZATION")) {
            List<OrganizationSearchDocument> docs = query.isEmpty() ? 
                orgList(organizationSearchRepository.findAll()) : 
                organizationSearchRepository.findByNameContainingOrDescriptionContaining(query, query);
            
            for (OrganizationSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getId())) {
                    double score = calculateScore(doc.getName(), doc.getDescription(), searchLower);
                    results.add(SearchResult.builder()
                            .type("ORGANIZATION")
                            .id(doc.getId())
                            .title(doc.getName())
                            .description(doc.getDescription())
                            .organization(doc.getName())
                            .organizationId(doc.getId())
                            .score(score)
                            .build());
                }
            }
        }

        // B. Contacts Index
        if (searchAll || entityType.equalsIgnoreCase("CONTACT")) {
            List<ContactSearchDocument> docs = query.isEmpty() ? 
                orgList(contactSearchRepository.findAll()) : 
                contactSearchRepository.findByFirstNameContainingOrLastNameContainingOrEmailContainingOrPhoneContainingOrRoleContainingOrNotesContaining(
                    query, query, query, query, query, query
                );
            for (ContactSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    String fullName = (doc.getFirstName() + " " + doc.getLastName()).trim();
                    double score = calculateScore(fullName, doc.getNotes(), searchLower);
                    results.add(SearchResult.builder()
                            .type("CONTACT")
                            .id(doc.getId())
                            .title(fullName)
                            .description(doc.getRole() != null ? doc.getRole() : "Contact")
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // C. Locations Index
        if (searchAll || entityType.equalsIgnoreCase("LOCATION")) {
            List<LocationSearchDocument> docs = query.isEmpty() ? 
                orgList(locationSearchRepository.findAll()) : 
                locationSearchRepository.findByNameContainingOrAddressContainingOrCityContainingOrNotesContaining(
                    query, query, query, query
                );
            for (LocationSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    double score = calculateScore(doc.getName(), doc.getNotes(), searchLower);
                    results.add(SearchResult.builder()
                            .type("LOCATION")
                            .id(doc.getId())
                            .title(doc.getName())
                            .description(doc.getAddress() + (doc.getCity() != null ? ", " + doc.getCity() : ""))
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // D. Assets Index
        if (searchAll || entityType.equalsIgnoreCase("ASSET")) {
            List<AssetSearchDocument> docs = query.isEmpty() ? 
                orgList(assetSearchRepository.findAll()) : 
                assetSearchRepository.findByNameContainingOrHostnameContainingOrIpAddressContainingOrSerialNumberContainingOrNotesContaining(
                    query, query, query, query, query
                );
            for (AssetSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    double score = calculateScore(doc.getName(), doc.getNotes(), searchLower);
                    results.add(SearchResult.builder()
                            .type("ASSET")
                            .id(doc.getId())
                            .title(doc.getName())
                            .description(doc.getAssetType() + " | " + doc.getIpAddress() + " | Hostname: " + doc.getHostname())
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // E. Documents Index
        if (searchAll || entityType.equalsIgnoreCase("DOCUMENT")) {
            List<DocumentSearchDocument> docs = query.isEmpty() ? 
                orgList(documentSearchRepository.findAll()) : 
                documentSearchRepository.findByTitleContainingOrContentContainingOrTagsContainingOrCategoryContaining(
                    query, query, query, query
                );
            for (DocumentSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    double score = calculateScore(doc.getTitle(), doc.getContent(), searchLower);
                    // Boost for tags match
                    if (doc.getTags() != null && doc.getTags().toLowerCase().contains(searchLower)) {
                        score += 30.0;
                    }
                    results.add(SearchResult.builder()
                            .type("DOCUMENT")
                            .id(doc.getId())
                            .title(doc.getTitle())
                            .description("Category: " + doc.getCategory() + " | Content: " + truncateContent(doc.getContent()))
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // F. Passwords Index
        if (searchAll || entityType.equalsIgnoreCase("PASSWORD")) {
            List<PasswordSearchDocument> docs = query.isEmpty() ? 
                orgList(passwordSearchRepository.findAll()) : 
                passwordSearchRepository.findByTitleContainingOrUsernameContainingOrUrlContainingOrNotesContaining(
                    query, query, query, query
                );
            for (PasswordSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    double score = calculateScore(doc.getTitle(), doc.getNotes(), searchLower);
                    // Boost tags match
                    if (doc.getTags() != null && doc.getTags().toLowerCase().contains(searchLower)) {
                        score += 30.0;
                    }
                    results.add(SearchResult.builder()
                            .type("PASSWORD")
                            .id(doc.getId())
                            .title(doc.getTitle())
                            .description("Username: " + doc.getUsername() + " | URL: " + doc.getUrl())
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // G. Applications Index
        if (searchAll || entityType.equalsIgnoreCase("APPLICATION")) {
            List<ApplicationSearchDocument> docs = query.isEmpty() ? 
                orgList(applicationSearchRepository.findAll()) : 
                applicationSearchRepository.findByNameContainingOrVendorContainingOrCategoryContainingOrDescriptionContaining(
                    query, query, query, query
                );
            for (ApplicationSearchDocument doc : docs) {
                if (authorizedOrgIds.contains(doc.getOrganizationId())) {
                    double score = calculateScore(doc.getName(), doc.getDescription(), searchLower);
                    results.add(SearchResult.builder()
                            .type("APPLICATION")
                            .id(doc.getId())
                            .title(doc.getName())
                            .description("Vendor: " + doc.getVendor() + " | " + doc.getDescription())
                            .organization(getOrgName(doc.getOrganizationId()))
                            .organizationId(doc.getOrganizationId())
                            .score(score)
                            .build());
                }
            }
        }

        // 3. Sort by Score Descending
        results.sort(Comparator.comparingDouble(SearchResult::getScore).reversed());

        // 4. Log search analytics in database asynchronously
        if (!query.isEmpty() && !authorizedOrgIds.isEmpty()) {
            UUID primaryOrgId = UUID.fromString(authorizedOrgIds.iterator().next());
            logSearchQuery(user.getId(), primaryOrgId, query, results.size());
        }

        log.info("Global Search query '{}' returned {} results in {}ms", 
                query, results.size(), System.currentTimeMillis() - startTime);

        return results;
    }

    /**
     * Get suggestions list.
     */
    public List<String> getSuggestions(String query, UserPrincipal user) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        List<SearchResult> searchResults = search(query, "ALL", null, user);
        return searchResults.stream()
                .map(SearchResult::getTitle)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    private <T> List<T> orgList(Iterable<T> iterable) {
        List<T> list = new ArrayList<>();
        iterable.forEach(list::add);
        return list;
    }

    private double calculateScore(String title, String notes, String queryLower) {
        if (queryLower.isEmpty()) return 1.0;
        double score = 0.0;
        String titleLower = title != null ? title.toLowerCase() : "";
        String notesLower = notes != null ? notes.toLowerCase() : "";

        // Exact match (highest boost)
        if (titleLower.equals(queryLower)) {
            score += 100.0;
        } 
        // Starts with title match
        else if (titleLower.startsWith(queryLower)) {
            score += 75.0;
        }
        // Title contains match (high boost)
        else if (titleLower.contains(queryLower)) {
            score += 50.0;
        }

        // Description/Notes contains match (low boost)
        if (notesLower.contains(queryLower)) {
            score += 10.0;
        }

        return score;
    }

    private String getOrgName(String organizationId) {
        try {
            return organizationRepository.findById(UUID.fromString(organizationId))
                    .map(Organization::getName)
                    .orElse("Unknown Org");
        } catch (Exception e) {
            return "Unknown Org";
        }
    }

    private String truncateContent(String content) {
        if (content == null) return "";
        if (content.length() <= 100) return content;
        return content.substring(0, 97) + "...";
    }

    private void logSearchQuery(UUID userId, UUID organizationId, String query, int count) {
        try {
            SearchLog logEntry = SearchLog.builder()
                    .userId(userId)
                    .organizationId(organizationId)
                    .query(query)
                    .resultCount(count)
                    .build();
            searchLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to log search query to analytics DB", e);
        }
    }

    /**
     * Get search analytics logs metrics.
     */
    public Map<String, Object> getAnalyticsMetrics(UUID orgId) {
        Map<String, Object> metrics = new HashMap<>();
        PageRequest limit = PageRequest.of(0, 10);
        
        metrics.put("topSearches", searchLogRepository.findTopSearchedTerms(orgId, limit));
        metrics.put("zeroResultSearches", searchLogRepository.findTopZeroResultSearches(orgId, limit));
        metrics.put("userActivity", searchLogRepository.findUserSearchActivity(orgId, limit));
        
        return metrics;
    }
}
