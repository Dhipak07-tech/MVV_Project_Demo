package com.managemyvault.dashboard.service;

import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.dashboard.dto.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    private UUID getScopeOrgId(UserPrincipal user) {
        if (user.isPlatformUser()) {
            return null;
        }
        return user.getOrganizationId();
    }

    private void checkOrgAdminScope(UserPrincipal user, UUID organizationId) {
        if (!user.isPlatformUser() && (user.getOrganizationId() == null || !user.getOrganizationId().equals(organizationId))) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied to organization scope");
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardKpis", key = "#user.id")
    public DashboardOverviewDto getOverview(UserPrincipal user) {
        UUID orgId = getScopeOrgId(user);
        
        long docCount = countCurrentDocs(orgId);
        long siteCount = countCurrentSites(orgId);
        long assetCount = countCurrentAssets(orgId);
        long passwordCount = countCurrentPasswords(orgId);
        long weakPasswords = countWeakPasswords(orgId);
        long expiredPasswords = countExpiredPasswords(orgId);
        long reusedPasswords = countReusedPasswords(orgId);
        long expiredSsl = countExpiredSsl(orgId);
        long expiredDomains = countExpiredDomains(orgId);
        long unreviewedExceptions = countUnreviewedExceptions(orgId);
        long failedBackups = countFailedBackups(orgId);

        // Compute scores
        int securityScore = calculateSecurityScore(weakPasswords, expiredPasswords, reusedPasswords, expiredSsl, expiredDomains, unreviewedExceptions);
        int docScore = Math.min(100, Math.max(50, 60 + (int) docCount * 5 + (int) siteCount * 5));
        int assetScore = Math.min(100, Math.max(50, 70 + (int) assetCount * 3));
        int passwordScore = Math.min(100, Math.max(50, 80 + (int) passwordCount * 2 - (int) weakPasswords * 5));
        int backupScore = Math.min(100, Math.max(50, 100 - (int) failedBackups * 20));
        int complianceScore = Math.min(100, Math.max(50, 100 - (int) unreviewedExceptions * 10));

        int overallHealth = (securityScore + docScore + assetScore + passwordScore + backupScore + complianceScore) / 6;
        String status = overallHealth >= 85 ? "Healthy" : overallHealth >= 60 ? "Warning" : "Critical";

        Map<String, Integer> breakdown = new HashMap<>();
        breakdown.put("documentation", docScore);
        breakdown.put("assets", assetScore);
        breakdown.put("passwords", passwordScore);
        breakdown.put("security", securityScore);
        breakdown.put("backups", backupScore);
        breakdown.put("compliance", complianceScore);

        List<DashboardOverviewDto.NotificationDto> notifications = new ArrayList<>();
        if (failedBackups > 0) {
            notifications.add(DashboardOverviewDto.NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .severity("CRITICAL")
                    .title("Backup Failure Detected")
                    .message(failedBackups + " backup solution(s) are reporting errors or failing verification.")
                    .timestamp(Instant.now())
                    .build());
        }
        if (expiredSsl > 0) {
            notifications.add(DashboardOverviewDto.NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .severity("WARNING")
                    .title("SSL Certificates Expired")
                    .message(expiredSsl + " tracked SSL certificate(s) have expired and need renewal.")
                    .timestamp(Instant.now())
                    .build());
        }
        if (expiredDomains > 0) {
            notifications.add(DashboardOverviewDto.NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .severity("WARNING")
                    .title("Domain Renewals Needed")
                    .message(expiredDomains + " domain(s) have expired domain registration status.")
                    .timestamp(Instant.now())
                    .build());
        }
        if (weakPasswords > 5) {
            notifications.add(DashboardOverviewDto.NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .severity("WARNING")
                    .title("Weak Credentials Found")
                    .message(weakPasswords + " active credentials have weak password entropy scores.")
                    .timestamp(Instant.now())
                    .build());
        }
        if (unreviewedExceptions > 0) {
            notifications.add(DashboardOverviewDto.NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .severity("INFO")
                    .title("Compliance Exception Review")
                    .message(unreviewedExceptions + " compliance exceptions are currently pending review.")
                    .timestamp(Instant.now())
                    .build());
        }

        return DashboardOverviewDto.builder()
                .healthScore(overallHealth)
                .healthStatus(status)
                .healthBreakdown(breakdown)
                .notifications(notifications)
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardKpis", key = "'stats:' + #user.id")
    public DashboardStatisticsDto getStatistics(UserPrincipal user) {
        UUID orgId = getScopeOrgId(user);
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        List<DashboardStatisticsDto.StatisticCard> cards = new ArrayList<>();

        if (user.isPlatformUser()) {
            cards.add(buildStatCard("Organizations", countCurrentOrgs(), countOrgsBefore(thirtyDaysAgo)));
        }
        cards.add(buildStatCard("Sites", countCurrentSites(orgId), countSitesBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Contacts", countCurrentContacts(orgId), countContactsBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Passwords", countCurrentPasswords(orgId), countPasswordsBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Documents", countCurrentDocs(orgId), countDocsBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Assets", countCurrentAssets(orgId), countAssetsBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Networks", countCurrentNetworks(orgId), countNetworksBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Vendors", countCurrentVendors(orgId), countVendorsBefore(orgId, thirtyDaysAgo)));
        cards.add(buildStatCard("Users", countCurrentUsers(orgId), countUsersBefore(orgId, thirtyDaysAgo)));

        return DashboardStatisticsDto.builder().cards(cards).build();
    }

    @Transactional(readOnly = true)
    public DashboardActivityDto getActivity(UserPrincipal user) {
        UUID orgId = getScopeOrgId(user);

        // Fetch recent activities from activity_events table
        String activityJpql = "SELECT e FROM ActivityEvent e WHERE (:orgId IS NULL OR e.organizationId = :orgId) ORDER BY e.timestamp DESC";
        TypedQuery<com.managemyvault.organization.domain.ActivityEvent> actQuery = entityManager.createQuery(activityJpql, com.managemyvault.organization.domain.ActivityEvent.class);
        actQuery.setParameter("orgId", orgId);
        actQuery.setMaxResults(25);
        List<com.managemyvault.organization.domain.ActivityEvent> activities = actQuery.getResultList();

        List<DashboardActivityDto.ActivityItem> recentActivity = new ArrayList<>();
        for (com.managemyvault.organization.domain.ActivityEvent ae : activities) {
            String userName = resolveUserName(ae.getUserId());
            String orgName = resolveOrgName(ae.getOrganizationId());

            recentActivity.add(DashboardActivityDto.ActivityItem.builder()
                    .id(ae.getId().toString())
                    .user(userName)
                    .action(ae.getAction())
                    .entityType(ae.getEntityType())
                    .entityId(ae.getEntityId().toString())
                    .details(ae.getDetails())
                    .organization(orgName)
                    .organizationId(ae.getOrganizationId().toString())
                    .timestamp(ae.getTimestamp())
                    .build());
        }

        // Fetch recently updated records across multiple entities (Passwords, Documents, Locations, Contacts, Assets)
        // Since they are separate tables, let's fetch the latest 5 of each and combine/sort in memory to get the top 25.
        List<DashboardActivityDto.UpdatedRecordItem> updatedRecords = new ArrayList<>();

        // 1. Passwords
        String passJpql = "SELECT p FROM Password p WHERE (:orgId IS NULL OR p.organizationId = :orgId) ORDER BY p.updatedAt DESC";
        TypedQuery<com.managemyvault.organization.domain.Password> passQuery = entityManager.createQuery(passJpql, com.managemyvault.organization.domain.Password.class);
        passQuery.setParameter("orgId", orgId);
        passQuery.setMaxResults(10);
        for (com.managemyvault.organization.domain.Password p : passQuery.getResultList()) {
            updatedRecords.add(DashboardActivityDto.UpdatedRecordItem.builder()
                    .id(p.getId().toString())
                    .title(p.getName())
                    .type("PASSWORD")
                    .updatedBy(resolveUserName(p.getUpdatedBy()))
                    .updatedAt(p.getUpdatedAt())
                    .organization(resolveOrgName(p.getOrganizationId()))
                    .organizationId(p.getOrganizationId().toString())
                    .build());
        }

        // 2. Documents
        String docJpql = "SELECT d FROM Document d WHERE (:orgId IS NULL OR d.organizationId = :orgId) ORDER BY d.updatedAt DESC";
        TypedQuery<com.managemyvault.organization.domain.Document> docQuery = entityManager.createQuery(docJpql, com.managemyvault.organization.domain.Document.class);
        docQuery.setParameter("orgId", orgId);
        docQuery.setMaxResults(10);
        for (com.managemyvault.organization.domain.Document d : docQuery.getResultList()) {
            updatedRecords.add(DashboardActivityDto.UpdatedRecordItem.builder()
                    .id(d.getId().toString())
                    .title(d.getTitle())
                    .type("DOCUMENT")
                    .updatedBy(resolveUserName(d.getUpdatedBy()))
                    .updatedAt(d.getUpdatedAt())
                    .organization(resolveOrgName(d.getOrganizationId()))
                    .organizationId(d.getOrganizationId().toString())
                    .build());
        }

        // 3. Locations (Sites)
        String locJpql = "SELECT l FROM Location l WHERE (:orgId IS NULL OR l.organization.id = :orgId) ORDER BY l.updatedAt DESC";
        TypedQuery<com.managemyvault.organization.domain.Location> locQuery = entityManager.createQuery(locJpql, com.managemyvault.organization.domain.Location.class);
        locQuery.setParameter("orgId", orgId);
        locQuery.setMaxResults(10);
        for (com.managemyvault.organization.domain.Location l : locQuery.getResultList()) {
            updatedRecords.add(DashboardActivityDto.UpdatedRecordItem.builder()
                    .id(l.getId().toString())
                    .title(l.getName())
                    .type("SITE")
                    .updatedBy(resolveUserName(l.getUpdatedBy()))
                    .updatedAt(l.getUpdatedAt())
                    .organization(resolveOrgName(l.getOrganization().getId()))
                    .organizationId(l.getOrganization().getId().toString())
                    .build());
        }

        // 4. Contacts
        String conJpql = "SELECT c FROM Contact c WHERE (:orgId IS NULL OR c.organization.id = :orgId) ORDER BY c.updatedAt DESC";
        TypedQuery<com.managemyvault.organization.domain.Contact> conQuery = entityManager.createQuery(conJpql, com.managemyvault.organization.domain.Contact.class);
        conQuery.setParameter("orgId", orgId);
        conQuery.setMaxResults(10);
        for (com.managemyvault.organization.domain.Contact c : conQuery.getResultList()) {
            updatedRecords.add(DashboardActivityDto.UpdatedRecordItem.builder()
                    .id(c.getId().toString())
                    .title(c.getName())
                    .type("CONTACT")
                    .updatedBy(resolveUserName(c.getUpdatedBy()))
                    .updatedAt(c.getUpdatedAt())
                    .organization(resolveOrgName(c.getOrganization().getId()))
                    .organizationId(c.getOrganization().getId().toString())
                    .build());
        }

        // 5. Assets
        String assetJpql = "SELECT a FROM Asset a WHERE (:orgId IS NULL OR a.organizationId = :orgId) ORDER BY a.updatedAt DESC";
        TypedQuery<com.managemyvault.organization.domain.Asset> assetQuery = entityManager.createQuery(assetJpql, com.managemyvault.organization.domain.Asset.class);
        assetQuery.setParameter("orgId", orgId);
        assetQuery.setMaxResults(10);
        for (com.managemyvault.organization.domain.Asset a : assetQuery.getResultList()) {
            updatedRecords.add(DashboardActivityDto.UpdatedRecordItem.builder()
                    .id(a.getId().toString())
                    .title(a.getName())
                    .type("ASSET")
                    .updatedBy(resolveUserName(a.getUpdatedBy()))
                    .updatedAt(a.getUpdatedAt())
                    .organization(resolveOrgName(a.getOrganizationId()))
                    .organizationId(a.getOrganizationId().toString())
                    .build());
        }

        // Sort combined list descending by updatedAt, limit to 25
        updatedRecords.sort(Comparator.comparing(DashboardActivityDto.UpdatedRecordItem::getUpdatedAt).reversed());
        if (updatedRecords.size() > 25) {
            updatedRecords = updatedRecords.subList(0, 25);
        }

        return DashboardActivityDto.builder()
                .recentActivity(recentActivity)
                .recentlyUpdated(updatedRecords)
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardTrends", key = "#user.id + ':' + #days")
    public DashboardTrendDto getTrends(UserPrincipal user, int days) {
        UUID orgId = getScopeOrgId(user);
        List<DashboardTrendDto.TrendDataPoint> trends = calculateTrends(orgId, days);
        return DashboardTrendDto.builder().trends(trends).build();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardOrgs", key = "#user.id")
    public List<DashboardOrganizationDto> getOrganizations(UserPrincipal user) {
        UUID orgId = getScopeOrgId(user);
        
        List<com.managemyvault.organization.domain.Organization> orgList = new ArrayList<>();
        if (orgId != null) {
            com.managemyvault.organization.domain.Organization org = entityManager.find(com.managemyvault.organization.domain.Organization.class, orgId);
            if (org != null && !org.isDeleted()) {
                orgList.add(org);
            }
        } else {
            String jpql = "SELECT o FROM Organization o WHERE o.deleted = false ORDER BY o.name ASC";
            orgList = entityManager.createQuery(jpql, com.managemyvault.organization.domain.Organization.class).getResultList();
        }

        List<DashboardOrganizationDto> dtos = new ArrayList<>();
        int index = 0;
        for (com.managemyvault.organization.domain.Organization o : orgList) {
            long siteCount = countCurrentSites(o.getId());
            long assetCount = countCurrentAssets(o.getId());

            dtos.add(DashboardOrganizationDto.builder()
                    .id(o.getId())
                    .name(o.getName())
                    .slug(o.getSlug())
                    .logoUrl(o.getLogoUrl())
                    .healthScore(o.getHealthScore() != null ? o.getHealthScore() : 100)
                    .siteCount(siteCount)
                    .assetCount(assetCount)
                    .pinned(index < 2) // Default pin first 2 for demonstrations
                    .favorite(index == 0) // Default favorite first org
                    .build());
            index++;
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardSecurity", key = "#user.id")
    public DashboardSecurityDto getSecurity(UserPrincipal user) {
        UUID orgId = getScopeOrgId(user);

        long weakPasswords = countWeakPasswords(orgId);
        long expiredPasswords = countExpiredPasswords(orgId);
        long reusedPasswords = countReusedPasswords(orgId);
        long missingRotation = countExpiredPasswords(orgId); // Map to same metric or similar
        long expiredDomains = countExpiredDomains(orgId);
        long expiredSsl = countExpiredSsl(orgId);
        long unreviewedExceptions = countUnreviewedExceptions(orgId);

        int score = calculateSecurityScore(weakPasswords, expiredPasswords, reusedPasswords, expiredSsl, expiredDomains, unreviewedExceptions);

        return DashboardSecurityDto.builder()
                .weakPasswords(weakPasswords)
                .expiredPasswords(expiredPasswords)
                .reusedPasswords(reusedPasswords)
                .missingRotationPasswords(missingRotation)
                .expiredDomains(expiredDomains)
                .expiredSslCertificates(expiredSsl)
                .unreviewedExceptions(unreviewedExceptions)
                .securityHealthScore(score)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardStorageDto getStorage(UserPrincipal user) {
        if (!user.isPlatformUser()) {
            throw new org.springframework.security.access.AccessDeniedException("Platform administration required for storage analytics");
        }

        long dbSize = 0;
        try {
            Object size = entityManager.createNativeQuery("SELECT pg_database_size(current_database())").getSingleResult();
            if (size != null) {
                dbSize = ((Number) size).longValue();
            }
        } catch (Exception e) {
            dbSize = 45000000; // Fallback to 45 MB if not postgres or error
        }

        long minioUsage = 0;
        try {
            Object sum = entityManager.createQuery("SELECT COALESCE(SUM(a.size), 0) FROM Attachment a").getSingleResult();
            minioUsage = ((Number) sum).longValue();
        } catch (Exception e) {
            // ignore
        }

        long attachmentCount = 0;
        try {
            Object count = entityManager.createQuery("SELECT COUNT(a) FROM Attachment a").getSingleResult();
            attachmentCount = ((Number) count).longValue();
        } catch (Exception e) {
            // ignore
        }

        long documentCount = 0;
        try {
            Object count = entityManager.createQuery("SELECT COUNT(d) FROM Document d").getSingleResult();
            documentCount = ((Number) count).longValue();
        } catch (Exception e) {
            // ignore
        }

        double avgSize = attachmentCount == 0 ? 0.0 : (double) minioUsage / attachmentCount;

        // Fetch storage growth trends over last 30 days
        List<DashboardStorageDto.StorageDataPoint> trends = new ArrayList<>();
        LocalDate end = LocalDate.now();
        long currentTotal = minioUsage;

        // Fetch attachment sizes and dates in last 30 days
        String queryStr = "SELECT a.size, a.createdAt FROM Attachment a WHERE a.createdAt >= :since";
        TypedQuery<Object[]> query = entityManager.createQuery(queryStr, Object[].class);
        query.setParameter("since", Instant.now().minus(30, ChronoUnit.DAYS));
        List<Object[]> results = query.getResultList();

        // Sort descending by date
        results.sort((a, b) -> ((Instant) b[1]).compareTo((Instant) a[1]));

        int idx = 0;
        for (int i = 0; i <= 30; i++) {
            LocalDate date = end.minusDays(i);
            Instant dayStart = date.atStartOfDay(ZoneOffset.UTC).toInstant();

            while (idx < results.size() && ((Instant) results.get(idx)[1]).isAfter(dayStart)) {
                long size = ((Number) results.get(idx)[0]).longValue();
                currentTotal -= size;
                idx++;
            }

            trends.add(DashboardStorageDto.StorageDataPoint.builder()
                    .date(date.toString())
                    .bytes(Math.max(0, currentTotal))
                    .build());
        }

        Collections.reverse(trends);

        return DashboardStorageDto.builder()
                .databaseSizeBytes(dbSize)
                .databaseSizeReadable(formatSize(dbSize))
                .minioUsageBytes(minioUsage)
                .minioUsageReadable(formatSize(minioUsage))
                .attachmentCount(attachmentCount)
                .documentCount(documentCount)
                .averageUploadSizeBytes(avgSize)
                .averageUploadSizeReadable(formatSize((long) avgSize))
                .trends(trends)
                .build();
    }

    private DashboardStatisticsDto.StatisticCard buildStatCard(String title, long current, long previous) {
        long change = current - previous;
        double growth = previous == 0 ? (current > 0 ? 100.0 : 0.0) : ((double) change * 100.0) / previous;
        String trend = change > 0 ? "UP" : change < 0 ? "DOWN" : "NEUTRAL";

        return DashboardStatisticsDto.StatisticCard.builder()
                .title(title)
                .count(current)
                .change30Days(change)
                .growthRate(Math.round(growth * 10.0) / 10.0)
                .trend(trend)
                .build();
    }

    // Helper counts
    private long countCurrentOrgs() {
        return (long) entityManager.createQuery("SELECT COUNT(o) FROM Organization o WHERE o.deleted = false").getSingleResult();
    }

    private long countOrgsBefore(Instant cutoff) {
        return (long) entityManager.createQuery("SELECT COUNT(o) FROM Organization o WHERE o.deleted = false AND o.createdAt < :cutoff")
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentSites(UUID orgId) {
        String jpql = "SELECT COUNT(l) FROM Location l WHERE (:orgId IS NULL OR l.organization.id = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countSitesBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(l) FROM Location l WHERE (:orgId IS NULL OR l.organization.id = :orgId) AND l.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentContacts(UUID orgId) {
        String jpql = "SELECT COUNT(c) FROM Contact c WHERE (:orgId IS NULL OR c.organization.id = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countContactsBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(c) FROM Contact c WHERE (:orgId IS NULL OR c.organization.id = :orgId) AND c.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentPasswords(UUID orgId) {
        String jpql = "SELECT COUNT(p) FROM Password p WHERE (:orgId IS NULL OR p.organizationId = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countPasswordsBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(p) FROM Password p WHERE (:orgId IS NULL OR p.organizationId = :orgId) AND p.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentDocs(UUID orgId) {
        String jpql = "SELECT COUNT(d) FROM Document d WHERE (:orgId IS NULL OR d.organizationId = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countDocsBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(d) FROM Document d WHERE (:orgId IS NULL OR d.organizationId = :orgId) AND d.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentAssets(UUID orgId) {
        String jpql = "SELECT COUNT(a) FROM Asset a WHERE (:orgId IS NULL OR a.organizationId = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countAssetsBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(a) FROM Asset a WHERE (:orgId IS NULL OR a.organizationId = :orgId) AND a.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentNetworks(UUID orgId) {
        String jpql = "SELECT COUNT(n) FROM NetworkMfa n WHERE n.type = 'networks' AND (:orgId IS NULL OR n.organizationId = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countNetworksBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(n) FROM NetworkMfa n WHERE n.type = 'networks' AND (:orgId IS NULL OR n.organizationId = :orgId) AND n.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentVendors(UUID orgId) {
        String jpql = "SELECT COUNT(v) FROM AppService v WHERE v.type = 'vendors' AND (:orgId IS NULL OR v.organizationId = :orgId)";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countVendorsBefore(UUID orgId, Instant cutoff) {
        String jpql = "SELECT COUNT(v) FROM AppService v WHERE v.type = 'vendors' AND (:orgId IS NULL OR v.organizationId = :orgId) AND v.createdAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", cutoff).getSingleResult();
    }

    private long countCurrentUsers(UUID orgId) {
        if (orgId == null) {
            long platformCount = (long) entityManager.createQuery("SELECT COUNT(u) FROM PlatformUser u WHERE u.active = true").getSingleResult();
            long memberCount = (long) entityManager.createQuery("SELECT COUNT(m) FROM OrganizationMember m WHERE m.isActive = true").getSingleResult();
            return platformCount + memberCount;
        } else {
            return (long) entityManager.createQuery("SELECT COUNT(m) FROM OrganizationMember m WHERE m.organizationId = :orgId AND m.isActive = true")
                    .setParameter("orgId", orgId).getSingleResult();
        }
    }

    private long countUsersBefore(UUID orgId, Instant cutoff) {
        if (orgId == null) {
            long platformCount = (long) entityManager.createQuery("SELECT COUNT(u) FROM PlatformUser u WHERE u.active = true AND u.createdAt < :cutoff")
                    .setParameter("cutoff", cutoff).getSingleResult();
            long memberCount = (long) entityManager.createQuery("SELECT COUNT(m) FROM OrganizationMember m WHERE m.isActive = true AND m.createdAt < :cutoff")
                    .setParameter("cutoff", cutoff).getSingleResult();
            return platformCount + memberCount;
        } else {
            return (long) entityManager.createQuery("SELECT COUNT(m) FROM OrganizationMember m WHERE m.organizationId = :orgId AND m.isActive = true AND m.createdAt < :cutoff")
                    .setParameter("orgId", orgId)
                    .setParameter("cutoff", cutoff).getSingleResult();
        }
    }

    private long countWeakPasswords(UUID orgId) {
        String jpql = "SELECT COUNT(p) FROM Password p WHERE (:orgId IS NULL OR p.organizationId = :orgId) AND LOWER(p.strength) = 'weak'";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countExpiredPasswords(UUID orgId) {
        Instant ninetyDaysAgo = Instant.now().minus(90, ChronoUnit.DAYS);
        String jpql = "SELECT COUNT(p) FROM Password p WHERE (:orgId IS NULL OR p.organizationId = :orgId) AND p.updatedAt < :cutoff";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("cutoff", ninetyDaysAgo).getSingleResult();
    }

    private long countReusedPasswords(UUID orgId) {
        String sql = "SELECT COUNT(*) FROM (SELECT password_encrypted FROM passwords WHERE (:orgId IS NULL OR organization_id = :orgId) GROUP BY password_encrypted HAVING COUNT(password_encrypted) > 1) AS tmp";
        try {
            Object count = entityManager.createNativeQuery(sql)
                    .setParameter("orgId", orgId)
                    .getSingleResult();
            return ((Number) count).longValue();
        } catch (Exception e) {
            return 0;
        }
    }

    private long countExpiredSsl(UUID orgId) {
        String jpql = "SELECT COUNT(t) FROM Tracker t WHERE t.type = 'SSL' AND (:orgId IS NULL OR t.organizationId = :orgId) AND t.expiryDate < :today";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("today", LocalDate.now()).getSingleResult();
    }

    private long countExpiredDomains(UUID orgId) {
        String jpql = "SELECT COUNT(t) FROM Tracker t WHERE t.type = 'Domain' AND (:orgId IS NULL OR t.organizationId = :orgId) AND t.expiryDate < :today";
        return (long) entityManager.createQuery(jpql)
                .setParameter("orgId", orgId)
                .setParameter("today", LocalDate.now()).getSingleResult();
    }

    private long countUnreviewedExceptions(UUID orgId) {
        String jpql = "SELECT COUNT(e) FROM ExceptionEntry e WHERE (:orgId IS NULL OR e.organizationId = :orgId) AND LOWER(e.status) = 'pending'";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private long countFailedBackups(UUID orgId) {
        String jpql = "SELECT COUNT(b) FROM BackupSolution b WHERE (:orgId IS NULL OR b.organizationId = :orgId) AND LOWER(b.status) NOT IN ('active', 'healthy', 'success')";
        return (long) entityManager.createQuery(jpql).setParameter("orgId", orgId).getSingleResult();
    }

    private int calculateSecurityScore(long weak, long expired, long reused, long ssl, long domain, long exceptions) {
        long deduction = (weak * 2) + (expired * 3) + (reused * 1) + (ssl * 5) + (domain * 5) + (exceptions * 2);
        return Math.min(100, Math.max(0, 100 - (int) deduction));
    }

    private String resolveUserName(UUID userId) {
        if (userId == null) return "System Bot";
        try {
            Object name = entityManager.createNativeQuery(
                    "SELECT full_name FROM platform_users WHERE id = :userId UNION ALL SELECT full_name FROM organization_members WHERE id = :userId")
                    .setParameter("userId", userId)
                    .getSingleResult();
            if (name != null) return name.toString();
        } catch (Exception e) {
            // ignore
        }
        return "System User";
    }

    private String resolveOrgName(UUID orgId) {
        if (orgId == null) return "Global Platform";
        try {
            com.managemyvault.organization.domain.Organization org = entityManager.find(com.managemyvault.organization.domain.Organization.class, orgId);
            if (org != null) return org.getName();
        } catch (Exception e) {
            // ignore
        }
        return "Unknown Organization";
    }

    private List<DashboardTrendDto.TrendDataPoint> calculateTrends(UUID orgId, int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days);
        Instant startInstant = start.atStartOfDay(ZoneOffset.UTC).toInstant();

        long assetsCount = countCurrentAssets(orgId);
        long passwordsCount = countCurrentPasswords(orgId);
        long documentsCount = countCurrentDocs(orgId);
        long contactsCount = countCurrentContacts(orgId);
        long sitesCount = countCurrentSites(orgId);

        List<Instant> assetDates = getCreationDates("Asset", orgId, startInstant);
        List<Instant> passwordDates = getCreationDates("Password", orgId, startInstant);
        List<Instant> docDates = getCreationDates("Document", orgId, startInstant);
        List<Instant> contactDates = getCreationDates("Contact", orgId, startInstant);
        List<Instant> siteDates = getCreationDates("Location", orgId, startInstant);

        Collections.sort(assetDates, Collections.reverseOrder());
        Collections.sort(passwordDates, Collections.reverseOrder());
        Collections.sort(docDates, Collections.reverseOrder());
        Collections.sort(contactDates, Collections.reverseOrder());
        Collections.sort(siteDates, Collections.reverseOrder());

        List<DashboardTrendDto.TrendDataPoint> points = new ArrayList<>();
        long currAssets = assetsCount;
        long currPasswords = passwordsCount;
        long currDocs = documentsCount;
        long currContacts = contactsCount;
        long currSites = sitesCount;

        int assetIdx = 0;
        int passwordIdx = 0;
        int docIdx = 0;
        int contactIdx = 0;
        int siteIdx = 0;

        for (int i = 0; i <= days; i++) {
            LocalDate date = end.minusDays(i);
            Instant dayStart = date.atStartOfDay(ZoneOffset.UTC).toInstant();

            while (assetIdx < assetDates.size() && assetDates.get(assetIdx).isAfter(dayStart)) {
                currAssets--;
                assetIdx++;
            }
            while (passwordIdx < passwordDates.size() && passwordDates.get(passwordIdx).isAfter(dayStart)) {
                currPasswords--;
                passwordIdx++;
            }
            while (docIdx < docDates.size() && docDates.get(docIdx).isAfter(dayStart)) {
                currDocs--;
                docIdx++;
            }
            while (contactIdx < contactDates.size() && contactDates.get(contactIdx).isAfter(dayStart)) {
                currContacts--;
                contactIdx++;
            }
            while (siteIdx < siteDates.size() && siteDates.get(siteIdx).isAfter(dayStart)) {
                currSites--;
                siteIdx++;
            }

            points.add(DashboardTrendDto.TrendDataPoint.builder()
                    .date(date.toString())
                    .assets(Math.max(0, currAssets))
                    .passwords(Math.max(0, currPasswords))
                    .documents(Math.max(0, currDocs))
                    .contacts(Math.max(0, currContacts))
                    .sites(Math.max(0, currSites))
                    .build());
        }

        Collections.reverse(points);
        return points;
    }

    private List<Instant> getCreationDates(String entityName, UUID orgId, Instant since) {
        String jpql;
        if (entityName.equals("Location") || entityName.equals("Contact")) {
            jpql = "SELECT e.createdAt FROM " + entityName + " e WHERE e.createdAt >= :since AND (:orgId IS NULL OR e.organization.id = :orgId)";
        } else {
            jpql = "SELECT e.createdAt FROM " + entityName + " e WHERE e.createdAt >= :since AND (:orgId IS NULL OR e.organizationId = :orgId)";
        }
        TypedQuery<Instant> query = entityManager.createQuery(jpql, Instant.class);
        query.setParameter("since", since);
        query.setParameter("orgId", orgId);
        return new ArrayList<>(query.getResultList());
    }

    private String formatSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(size)/Math.log10(1024));
        return new java.text.DecimalFormat("#,##0.#").format(size/Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }
}
