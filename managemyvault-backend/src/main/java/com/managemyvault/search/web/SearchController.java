package com.managemyvault.search.web;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.search.application.GlobalSearchService;
import com.managemyvault.search.application.SearchIndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final GlobalSearchService globalSearchService;
    private final SearchIndexService searchIndexService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(value = "q", required = false, defaultValue = "") String query,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "organizationId", required = false) String organizationId,
            @CurrentUser UserPrincipal currentUser) {
        
        List<GlobalSearchService.SearchResult> results = globalSearchService.search(query, type, organizationId, currentUser);
        return ResponseEntity.ok(Map.of("results", results));
    }

    @GetMapping("/suggest")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam("q") String query,
            @CurrentUser UserPrincipal currentUser) {
        
        List<String> suggestions = globalSearchService.getSuggestions(query, currentUser);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/analytics")
    @PreAuthorize("@orgAccessControl.canAccess(#organizationId)")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @RequestParam("organizationId") UUID organizationId) {
        
        Map<String, Object> metrics = globalSearchService.getAnalyticsMetrics(organizationId);
        return ResponseEntity.ok(metrics);
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> reindex() {
        searchIndexService.reindexAll();
        return ResponseEntity.ok(Map.of("message", "Reindexing triggered successfully across all indices"));
    }
}
