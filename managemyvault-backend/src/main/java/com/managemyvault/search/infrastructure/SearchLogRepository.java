package com.managemyvault.search.infrastructure;

import com.managemyvault.search.domain.SearchLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, UUID> {

    interface TermCount {
        String getQuery();
        Long getCount();
    }

    interface UserCount {
        UUID getUserId();
        Long getCount();
    }

    @Query("SELECT s.query as query, COUNT(s.query) as count FROM SearchLog s WHERE s.organizationId = :organizationId GROUP BY s.query ORDER BY COUNT(s.query) DESC")
    List<TermCount> findTopSearchedTerms(UUID organizationId, Pageable pageable);

    @Query("SELECT s.query as query, COUNT(s.query) as count FROM SearchLog s WHERE s.organizationId = :organizationId AND s.resultCount = 0 GROUP BY s.query ORDER BY COUNT(s.query) DESC")
    List<TermCount> findTopZeroResultSearches(UUID organizationId, Pageable pageable);

    @Query("SELECT s.userId as userId, COUNT(s.userId) as count FROM SearchLog s WHERE s.organizationId = :organizationId GROUP BY s.userId ORDER BY COUNT(s.userId) DESC")
    List<UserCount> findUserSearchActivity(UUID organizationId, Pageable pageable);
}
