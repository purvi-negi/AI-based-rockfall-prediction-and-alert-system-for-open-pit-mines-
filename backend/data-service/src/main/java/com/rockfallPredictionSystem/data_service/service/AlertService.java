package com.rockfallPredictionSystem.data_service.service;

import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.AlertResponse;
import com.rockfallPredictionSystem.data_service.entity.Alert;
import com.rockfallPredictionSystem.data_service.entity.AlertStatus;
import com.rockfallPredictionSystem.data_service.repository.AlertRepository;
import com.rockfallPredictionSystem.data_service.repository.MineRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final MineRepository mineRepository;

    public AlertService(AlertRepository alertRepository, MineRepository mineRepository) {
        this.alertRepository = alertRepository;
        this.mineRepository = mineRepository;
    }

    /**
     * Evaluates a prediction response and creates an alert if riskLevel is WARNING or CRITICAL.
     * SAFE and LOW risk levels do not create alerts.
     * Prevents duplicate alert creation for the same predictionId.
     *
     * @param prediction The prediction response returned by Prediction Service.
     * @return An Optional containing the saved (or existing) Alert, or empty if no alert was warranted.
     */
    @Transactional
    public Optional<Alert> createAlertIfApplicable(PredictionResponse prediction) {
        if (prediction == null) {
            log.debug("Prediction is null; skipping alert evaluation.");
            return Optional.empty();
        }

        if (prediction.getId() == null) {
            log.warn("Prediction response is missing an ID; cannot associate alert without predictionId.");
            return Optional.empty();
        }

        if (prediction.getMineId() == null) {
            log.warn("Prediction response (id={}) is missing mineId; cannot associate alert without mineId.", prediction.getId());
            return Optional.empty();
        }

        String rawRiskLevel = prediction.getRiskLevel();
        if (rawRiskLevel == null) {
            log.debug("Prediction id={} has null risk level; skipping alert creation.", prediction.getId());
            return Optional.empty();
        }

        String riskLevel = rawRiskLevel.trim().toUpperCase();

        // Requirement: Create alerts ONLY for WARNING and CRITICAL risk levels.
        // SAFE and LOW must not create alerts.
        if (!"WARNING".equals(riskLevel) && !"CRITICAL".equals(riskLevel)) {
            log.debug("Prediction id={} with riskLevel='{}' does not qualify for alert. (SAFE and LOW are ignored).",
                    prediction.getId(), riskLevel);
            return Optional.empty();
        }

        // Duplicate prevention: check before saving
        if (alertRepository.existsByPredictionId(prediction.getId())) {
            log.info("Alert already exists for predictionId={}. Skipping duplicate creation.", prediction.getId());
            return alertRepository.findByPredictionId(prediction.getId());
        }

        Double hazardProb = prediction.getHazardProbability();
        double probVal = hazardProb != null ? hazardProb : 0.0;

        String message = String.format(
                "Rockfall risk level %s detected (hazard probability: %.3f) for mine ID %d%s (Prediction ID: %d).",
                riskLevel,
                probVal,
                prediction.getMineId(),
                prediction.getSnapshotId() != null ? ", Snapshot ID: " + prediction.getSnapshotId() : "",
                prediction.getId()
        );

        Alert alert = Alert.builder()
                .mineId(prediction.getMineId())
                .predictionId(prediction.getId())
                .snapshotId(prediction.getSnapshotId())
                .riskLevel(riskLevel)
                .hazardProbability(probVal)
                .message(message)
                .status(AlertStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        try {
            Alert saved = alertRepository.save(alert);
            log.warn("[ALERT CREATED] {} alert id={} generated for mineId={}, predictionId={}, hazardProbability={}",
                    saved.getRiskLevel(), saved.getId(), saved.getMineId(), saved.getPredictionId(), saved.getHazardProbability());
            return Optional.of(saved);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Database unique constraint triggered for predictionId={}. Fetching existing alert.", prediction.getId());
            return alertRepository.findByPredictionId(prediction.getId());
        } catch (Exception ex) {
            log.error("Unexpected error saving alert for predictionId={}: {}", prediction.getId(), ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    /**
     * Returns all alerts ordered by creation time descending (newest first).
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AlertResponse::fromEntity)
                .toList();
    }

    /**
     * Returns all alerts for a specific mine ordered by creation time descending.
     *
     * @throws NoSuchElementException if mineId does not exist in the database.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByMineId(Long mineId) {
        if (mineId == null) {
            throw new IllegalArgumentException("mineId cannot be null.");
        }
        if (!mineRepository.existsById(mineId)) {
            throw new NoSuchElementException("Mine not found with id: " + mineId);
        }
        return alertRepository.findByMineIdOrderByCreatedAtDesc(mineId)
                .stream()
                .map(AlertResponse::fromEntity)
                .toList();
    }

    /**
     * Returns all alerts matching the specified status ordered by creation time descending.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByStatus(AlertStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("status cannot be null.");
        }
        return alertRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(AlertResponse::fromEntity)
                .toList();
    }

    /**
     * Transitions an alert from PENDING to ACKNOWLEDGED.
     *
     * @param alertId The ID of the alert.
     * @return The updated AlertResponse.
     * @throws NoSuchElementException if alert not found.
     * @throws IllegalStateException if transition is invalid.
     */
    @Transactional
    public AlertResponse acknowledgeAlert(Long alertId) {
        if (alertId == null) {
            throw new IllegalArgumentException("alertId cannot be null.");
        }
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new NoSuchElementException("Alert not found with id: " + alertId));

        alert.acknowledge();
        Alert updated = alertRepository.save(alert);
        log.info("Alert id={} successfully transitioned to ACKNOWLEDGED.", updated.getId());
        return AlertResponse.fromEntity(updated);
    }

    /**
     * Transitions an alert from ACKNOWLEDGED to RESOLVED.
     *
     * @param alertId The ID of the alert.
     * @return The updated AlertResponse.
     * @throws NoSuchElementException if alert not found.
     * @throws IllegalStateException if transition is invalid.
     */
    @Transactional
    public AlertResponse resolveAlert(Long alertId) {
        if (alertId == null) {
            throw new IllegalArgumentException("alertId cannot be null.");
        }
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new NoSuchElementException("Alert not found with id: " + alertId));

        alert.resolve();
        Alert updated = alertRepository.save(alert);
        log.info("Alert id={} successfully transitioned to RESOLVED.", updated.getId());
        return AlertResponse.fromEntity(updated);
    }
}

