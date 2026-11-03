package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.client.PredictionServiceClient;
import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotRequest;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotResponse;
import com.rockfallPredictionSystem.data_service.entity.Mine;
import com.rockfallPredictionSystem.data_service.entity.MonitoringSnapshot;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import com.rockfallPredictionSystem.data_service.repository.MonitoringSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MonitoringSnapshotService {

    private static final Logger log = LoggerFactory.getLogger(MonitoringSnapshotService.class);

    private final MonitoringSnapshotRepository monitoringSnapshotRepository;
    private final MineRepository mineRepository;
    private final PredictionServiceClient predictionServiceClient;
    private final AlertService alertService;

    public MonitoringSnapshotService(
            MonitoringSnapshotRepository monitoringSnapshotRepository,
            MineRepository mineRepository,
            PredictionServiceClient predictionServiceClient,
            AlertService alertService
    ) {
        this.monitoringSnapshotRepository = monitoringSnapshotRepository;
        this.mineRepository = mineRepository;
        this.predictionServiceClient = predictionServiceClient;
        this.alertService = alertService;
    }

    public MonitoringSnapshotResponse saveSnapshot(MonitoringSnapshotRequest request) {
        validateRequest(request);

        Mine mine = mineRepository.findById(request.getMineId())
                .orElseThrow(() -> new NoSuchElementException("Mine not found with id: " + request.getMineId()));

        MonitoringSnapshot snapshot = MonitoringSnapshot.builder()
                .mine(mine)
                .groundTilt(request.getGroundTilt())
                .discontinuityAngle(request.getDiscontinuityAngle())
                .jointSpacing(request.getJointSpacing())
                .poreWaterPressure(request.getPoreWaterPressure())
                .vibrationRmr(request.getVibrationRmr())
                .rainfallMm(request.getRainfallMm())
                .build();

        MonitoringSnapshot saved = monitoringSnapshotRepository.save(snapshot);
        return MonitoringSnapshotResponse.fromEntity(saved);
    }

    public MonitoringSnapshotResponse getLatestSnapshot(Long mineId) {
        if (!mineRepository.existsById(mineId)) {
            throw new NoSuchElementException("Mine not found with id: " + mineId);
        }

        MonitoringSnapshot snapshot = monitoringSnapshotRepository.findFirstByMineIdOrderByRecordedAtDesc(mineId)
                .orElseThrow(() -> new NoSuchElementException("No monitoring snapshot found for mine id: " + mineId));

        return MonitoringSnapshotResponse.fromEntity(snapshot);
    }

    public List<MonitoringSnapshotResponse> getSnapshotsByMineId(Long mineId) {
        if (!mineRepository.existsById(mineId)) {
            throw new NoSuchElementException("Mine not found with id: " + mineId);
        }

        return monitoringSnapshotRepository.findByMineIdOrderByRecordedAtDesc(mineId)
                .stream()
                .map(MonitoringSnapshotResponse::fromEntity)
                .toList();
    }

    public MonitoringSnapshotResponse getSnapshotById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Snapshot id cannot be null.");
        }
        MonitoringSnapshot snapshot = monitoringSnapshotRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Monitoring snapshot not found with id: " + id));
        return MonitoringSnapshotResponse.fromEntity(snapshot);
    }

    /**
     * Manually triggers prediction and alert processing for an existing monitoring snapshot.
     *
     * @param id The ID of the saved monitoring snapshot.
     * @return The PredictionResponse from the Prediction Service.
     * @throws NoSuchElementException if snapshot not found (maps to 404).
     * @throws IllegalStateException if empty response from Prediction Service.
     */
    public PredictionResponse predictSnapshot(Long id) {
        MonitoringSnapshotResponse snapshot = getSnapshotById(id);

        log.info("Triggering manual prediction for snapshot id={} (mineId={})", snapshot.getId(), snapshot.getMineId());
        PredictionResponse prediction = predictionServiceClient.predict(snapshot);

        if (prediction == null) {
            throw new IllegalStateException("Received empty response from Prediction Service for snapshot id: " + id);
        }

        log.info("[MANUAL PREDICTION] Snapshot id={} evaluated: predictedClass={}, riskLevel={}, hazardProbability={}, alert={}",
                snapshot.getId(),
                prediction.getPredictedClass(),
                prediction.getRiskLevel(),
                prediction.getHazardProbability(),
                prediction.getTriggerAlert());

        try {
            alertService.createAlertIfApplicable(prediction);
        } catch (Exception alertEx) {
            log.error("[ALERT ERROR] Error creating alert for manual prediction id={} (snapshot id={}): {}",
                    prediction.getId(), snapshot.getId(), alertEx.getMessage(), alertEx);
        }

        return prediction;
    }

    private void validateRequest(MonitoringSnapshotRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Monitoring snapshot request cannot be null.");
        }
        if (request.getMineId() == null) {
            throw new IllegalArgumentException("mineId is required and cannot be null.");
        }
        validateValue("groundTilt", request.getGroundTilt());
        validateValue("discontinuityAngle", request.getDiscontinuityAngle());
        validateValue("jointSpacing", request.getJointSpacing());
        validateValue("poreWaterPressure", request.getPoreWaterPressure());
        validateValue("vibrationRmr", request.getVibrationRmr());
        validateValue("rainfallMm", request.getRainfallMm());
    }

    private void validateValue(String fieldName, Double value) {
        if (value == null) {
            throw new IllegalArgumentException("Field '" + fieldName + "' is required and cannot be null.");
        }
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            throw new IllegalArgumentException("Field '" + fieldName + "' must be a finite numeric value.");
        }
    }
}
