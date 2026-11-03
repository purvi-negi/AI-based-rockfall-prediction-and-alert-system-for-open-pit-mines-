package com.rockfallPredictionSystem.data_service.controller;

import com.rockfallPredictionSystem.data_service.dto.DashboardSummaryResponse;
import com.rockfallPredictionSystem.data_service.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/summary
     * Returns consolidated dashboard summary:
     * - Mine metrics (total, active)
     * - Sensor metrics (total, active)
     * - Latest snapshot for each mine
     * - Alert metrics (total, pending, acknowledged, resolved)
     * - Latest prediction
     * - 10 most recent predictions
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(response);
    }
}

