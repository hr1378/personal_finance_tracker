package com.finance.dashboard.controller;

import com.finance.dashboard.dto.DashboardSummary;
import com.finance.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary/{userId}")
    public ResponseEntity<DashboardSummary> getSummary(@PathVariable UUID userId) {
        DashboardSummary summary = dashboardService.getDashboardSummary(userId).block();
        return ResponseEntity.ok(summary);
    }
}
