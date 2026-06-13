package com.managemyvault.dashboard.controller;

import com.managemyvault.common.security.CurrentUser;
import com.managemyvault.common.security.UserPrincipal;
import com.managemyvault.dashboard.dto.*;
import com.managemyvault.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<DashboardOverviewDto> getOverview(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getOverview(currentUser));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<DashboardStatisticsDto> getStatistics(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getStatistics(currentUser));
    }

    @GetMapping("/activity")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<DashboardActivityDto> getActivity(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getActivity(currentUser));
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<DashboardTrendDto> getTrends(
            @RequestParam(value = "days", required = false, defaultValue = "30") int days,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getTrends(currentUser, days));
    }

    @GetMapping("/organizations")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<List<DashboardOrganizationDto>> getOrganizations(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getOrganizations(currentUser));
    }

    @GetMapping("/security")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN')")
    public ResponseEntity<DashboardSecurityDto> getSecurity(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getSecurity(currentUser));
    }

    @GetMapping("/storage")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<DashboardStorageDto> getStorage(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(dashboardService.getStorage(currentUser));
    }
}
