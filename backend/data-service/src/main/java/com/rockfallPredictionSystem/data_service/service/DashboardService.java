package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.client.PredictionServiceClient;
import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.DashboardSummaryResponse;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotResponse;
import com.rockfallPredictionSystem.data_service.entity.AlertStatus;
import com.rockfallPredictionSystem.data_service.repository.AlertRepository;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import com.rockfallPredictionSystem.data_service.repository.MonitoringSnapshotRepository;
import com.rockfallPredictionSystem.data_service.repository.SensorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final MineRepository mineRepository;
    private final SensorRepository sensorRepository;
    private final AlertRepository alertRepository;
    private final MonitoringSnapshotRepository monitoringSnapshotRepository;
    private final PredictionServiceClient predictionServiceClient;

    public DashboardService(
            MineRepository mineRepository,
            SensorRepository sensorRepository,
            AlertRepository alertRepository,
            MonitoringSnapshotRepository monitoringSnapshotRepository,
            PredictionServiceClient predictionServiceClient
    ) {
        this.mineRepository = mineRepository;
        this.sensorRepository = sensorRepository;
        this.alertRepository = alertRepository;
        this.monitoringSnapshotRepository = monitoringSnapshotRepository;
        this.predictionServiceClient = predictionServiceClient;
    }

    /**
     * Aggregates complete dashboard telemetry:
     * - Mine metrics (total, active)
     * - Sensor metrics (total, active)
     * - Latest monitoring snapshot for each mine
     * - Alert metrics by status (total, pending, acknowledged, resolved)
     * - Latest prediction and recent 10 predictions (from Prediction Service)
     *
     * @return Consolidated DashboardSummaryResponse.
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        // 1. Mine statistics
        long totalMines = mineRepository.count();
        long activeMines = mineRepository.countByStatusIgnoreCase("ACTIVE");
        DashboardSummaryResponse.MineStats mineStats = DashboardSummaryResponse.MineStats.builder()
                .total(totalMines)
                .active(activeMines)
                .build();

        // 2. Sensor statistics
        long totalSensors = sensorRepository.count();
        long activeSensors = sensorRepository.countByStatusIgnoreCase("ACTIVE");
        DashboardSummaryResponse.SensorStats sensorStats = DashboardSummaryResponse.SensorStats.builder()
                .total(totalSensors)
                .active(activeSensors)
                .build();

        // 3. Latest monitoring snapshots per mine
        List<MonitoringSnapshotResponse> latestSnapshots = monitoringSnapshotRepository.findLatestSnapshotsPerMine()
                .stream()
                .map(MonitoringSnapshotResponse::fromEntity)
                .toList();

        // 4. Alert statistics
        long totalAlerts = alertRepository.count();
        long pendingAlerts = alertRepository.countByStatus(AlertStatus.PENDING);
        long acknowledgedAlerts = alertRepository.countByStatus(AlertStatus.ACKNOWLEDGED);
        long resolvedAlerts = alertRepository.countByStatus(AlertStatus.RESOLVED);
        DashboardSummaryResponse.AlertStats alertStats = DashboardSummaryResponse.AlertStats.builder()
                .total(totalAlerts)
                .pending(pendingAlerts)
                .acknowledged(acknowledgedAlerts)
                .resolved(resolvedAlerts)
                .build();

        // 5 & 6. Latest and recent predictions from Prediction Service
        List<PredictionResponse> recentPredictions;
        try {
            recentPredictions = predictionServiceClient.getRecentPredictions(10);
            if (recentPredictions == null) {
                recentPredictions = Collections.emptyList();
            }
        } catch (Exception ex) {
            log.warn("Prediction Service is unavailable while fetching dashboard summary: {}. " +
                    "Returning empty predictions without fabricating data.", ex.getMessage());
            recentPredictions = Collections.emptyList();
        }

        PredictionResponse latestPrediction = recentPredictions.isEmpty() ? null : recentPredictions.get(0);

        return DashboardSummaryResponse.builder()
                .mineStats(mineStats)
                .sensorStats(sensorStats)
                .latestSnapshots(latestSnapshots)
                .alertStats(alertStats)
                .latestPrediction(latestPrediction)
                .recentPredictions(recentPredictions)
                .build();
    }
}

