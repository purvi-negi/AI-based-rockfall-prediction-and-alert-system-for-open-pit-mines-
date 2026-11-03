package com.rockfallPredictionSystem.data_service.simulator;

import com.rockfallPredictionSystem.data_service.client.PredictionServiceClient;
import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotRequest;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotResponse;
import com.rockfallPredictionSystem.data_service.entity.Mine;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import com.rockfallPredictionSystem.data_service.service.AlertService;
import com.rockfallPredictionSystem.data_service.service.MonitoringSnapshotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Scheduled component that periodically generates synthetic monitoring snapshots for all ACTIVE mines.
 * <p>
 * IMPORTANT: All generated readings are synthetic demo data for simulation purposes and must NOT
 * be treated as actual physical sensor measurements.
 * <p>
 * Feature ranges are grounded directly in the verified ML training dataset (data/rockfall_imbalanced_dataset.csv / dataset_generator.py):
 * - groundTilt: [5.0, 45.0] degrees
 * - discontinuityAngle: [10.0, 85.0] degrees
 * - jointSpacing: [0.1, 3.0] meters
 * - poreWaterPressure: [0.0, 150.0] kPa
 * - vibrationRmr: [10.0, 90.0]
 * - rainfallMm: [0.0, 120.0] mm
 */
@Component
public class SensorDataSimulator {

    private static final Logger log = LoggerFactory.getLogger(SensorDataSimulator.class);

    // Verified ranges from training dataset:
    private static final double MIN_GROUND_TILT = 5.0;
    private static final double MAX_GROUND_TILT = 45.0;

    private static final double MIN_DISCONTINUITY_ANGLE = 10.0;
    private static final double MAX_DISCONTINUITY_ANGLE = 85.0;

    private static final double MIN_JOINT_SPACING = 0.1;
    private static final double MAX_JOINT_SPACING = 3.0;

    private static final double MIN_PORE_WATER_PRESSURE = 0.0;
    private static final double MAX_PORE_WATER_PRESSURE = 150.0;

    private static final double MIN_VIBRATION_RMR = 10.0;
    private static final double MAX_VIBRATION_RMR = 90.0;

    private static final double MIN_RAINFALL_MM = 0.0;
    private static final double MAX_RAINFALL_MM = 120.0;

    private final MineRepository mineRepository;
    private final MonitoringSnapshotService monitoringSnapshotService;
    private final PredictionServiceClient predictionServiceClient;
    private final AlertService alertService;
    private final AtomicBoolean isSimulating = new AtomicBoolean(false);

    public SensorDataSimulator(
            MineRepository mineRepository,
            MonitoringSnapshotService monitoringSnapshotService,
            PredictionServiceClient predictionServiceClient,
            AlertService alertService
    ) {
        this.mineRepository = mineRepository;
        this.monitoringSnapshotService = monitoringSnapshotService;
        this.predictionServiceClient = predictionServiceClient;
        this.alertService = alertService;
    }

    @Scheduled(fixedRateString = "${monitoring.simulator.interval-ms:10000}")
    public void generateSyntheticSnapshots() {
        if (!isSimulating.compareAndSet(false, true)) {
            log.debug("[DEMO SIMULATOR] Previous simulation cycle is still running. Skipping execution.");
            return;
        }

        try {
            List<Mine> activeMines = mineRepository.findAll().stream()
                    .filter(mine -> mine.getStatus() != null && "ACTIVE".equalsIgnoreCase(mine.getStatus().trim()))
                    .toList();

            if (activeMines.isEmpty()) {
                log.debug("[DEMO SIMULATOR] No active mines found for synthetic monitoring snapshot generation.");
                return;
            }

            for (Mine mine : activeMines) {
                MonitoringSnapshotResponse savedSnapshot = null;
                try {
                    MonitoringSnapshotRequest request = generateSyntheticRequest(mine.getId());
                    savedSnapshot = monitoringSnapshotService.saveSnapshot(request);
                    log.info("[DEMO SIMULATOR] Generated synthetic snapshot id={} for active mine id={} ('{}') | tilt={}°, discAngle={}°, spacing={}m, pwp={}kPa, rmr={}, rain={}mm",
                            savedSnapshot.getId(),
                            mine.getId(),
                            mine.getMineName(),
                            savedSnapshot.getGroundTilt(),
                            savedSnapshot.getDiscontinuityAngle(),
                            savedSnapshot.getJointSpacing(),
                            savedSnapshot.getPoreWaterPressure(),
                            savedSnapshot.getVibrationRmr(),
                            savedSnapshot.getRainfallMm());
                } catch (Exception ex) {
                    log.error("[DEMO SIMULATOR] Error generating/saving synthetic snapshot for mine id={}: {}",
                            mine.getId(), ex.getMessage(), ex);
                    continue; // Skip prediction if snapshot failed to save
                }

                // 2. Automatically send the saved snapshot to Prediction Service
                if (savedSnapshot != null && savedSnapshot.getId() != null) {
                    try {
                        PredictionResponse prediction = predictionServiceClient.predict(savedSnapshot);
                        if (prediction != null) {
                            log.info("[PREDICTION] Snapshot id={} (mineId={}) evaluated: predictedClass={}, riskLevel={}, hazardProbability={}, alert={}",
                                    savedSnapshot.getId(),
                                    savedSnapshot.getMineId(),
                                    prediction.getPredictedClass(),
                                    prediction.getRiskLevel(),
                                    prediction.getHazardProbability(),
                                    prediction.getTriggerAlert());

                            // 3. Automatically evaluate prediction for alert creation (WARNING / CRITICAL)
                            try {
                                alertService.createAlertIfApplicable(prediction);
                            } catch (Exception alertEx) {
                                log.error("[ALERT ERROR] Error creating alert for prediction id={} (snapshot id={}, mine id={}): {}",
                                        prediction.getId(),
                                        savedSnapshot.getId(),
                                        savedSnapshot.getMineId(),
                                        alertEx.getMessage(),
                                        alertEx);
                            }
                        }
                    } catch (Exception ex) {
                        log.error("[PREDICTION ERROR] Failed to obtain ML prediction for saved snapshot id={} (mine id={}): {}. Snapshot remains safely persisted.",
                                savedSnapshot.getId(),
                                savedSnapshot.getMineId(),
                                ex.getMessage());
                        // Prediction failure does not crash the simulator or delete the snapshot
                    }
                }
            }
        } catch (Exception ex) {
            log.error("[DEMO SIMULATOR] Unexpected error during scheduled synthetic snapshot generation: {}", ex.getMessage(), ex);
        } finally {
            isSimulating.set(false);
        }
    }

    private MonitoringSnapshotRequest generateSyntheticRequest(Long mineId) {
        ThreadLocalRandom random = ThreadLocalRandom.current();

        double groundTilt = roundToTwoDecimals(random.nextDouble(MIN_GROUND_TILT, MAX_GROUND_TILT));
        double discontinuityAngle = roundToTwoDecimals(random.nextDouble(MIN_DISCONTINUITY_ANGLE, MAX_DISCONTINUITY_ANGLE));
        double jointSpacing = roundToTwoDecimals(random.nextDouble(MIN_JOINT_SPACING, MAX_JOINT_SPACING));
        double poreWaterPressure = roundToTwoDecimals(random.nextDouble(MIN_PORE_WATER_PRESSURE, MAX_PORE_WATER_PRESSURE));
        double vibrationRmr = roundToTwoDecimals(random.nextDouble(MIN_VIBRATION_RMR, MAX_VIBRATION_RMR));
        double rainfallMm = roundToTwoDecimals(random.nextDouble(MIN_RAINFALL_MM, MAX_RAINFALL_MM));

        return MonitoringSnapshotRequest.builder()
                .mineId(mineId)
                .groundTilt(groundTilt)
                .discontinuityAngle(discontinuityAngle)
                .jointSpacing(jointSpacing)
                .poreWaterPressure(poreWaterPressure)
                .vibrationRmr(vibrationRmr)
                .rainfallMm(rainfallMm)
                .build();
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
