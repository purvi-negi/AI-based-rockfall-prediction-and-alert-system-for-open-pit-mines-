package com.rockfallPredictionSystem.prediction_service.service;

import com.rockfallPredictionSystem.prediction_service.client.MlServiceClient;
import com.rockfallPredictionSystem.prediction_service.dto.MlHealthResponseDTO;
import com.rockfallPredictionSystem.prediction_service.dto.MlPredictionResponseDTO;
import com.rockfallPredictionSystem.prediction_service.dto.PredictionRequestDTO;
import com.rockfallPredictionSystem.prediction_service.dto.PredictionResponseDTO;
import com.rockfallPredictionSystem.prediction_service.entity.PredictionHistory;
import com.rockfallPredictionSystem.prediction_service.repository.PredictionHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    private static final Logger log = LoggerFactory.getLogger(PredictionService.class);

    private final MlServiceClient mlServiceClient;
    private final PredictionHistoryRepository repository;

    public PredictionService(MlServiceClient mlServiceClient, PredictionHistoryRepository repository) {
        this.mlServiceClient = mlServiceClient;
        this.repository = repository;
    }

    /**
     * Validates input parameters, invokes Python ML service for prediction,
     * persists the complete record into Neon PostgreSQL, and returns the response.
     * <p>
     * When snapshotId is provided:
     * - Checks if a prediction already exists for that snapshot, returning it without re-calling the ML API.
     * - Saves with snapshotId and mineId.
     * - Database uniqueness on snapshot_id prevents duplicates; concurrent race conditions
     *   are handled safely by returning the already-saved prediction.
     */
    public PredictionResponseDTO predictAndSave(PredictionRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Prediction request body cannot be null.");
        }
        request.validate();

        // 1. If snapshotId is provided, check if prediction already exists (avoids duplicate ML calls)
        if (request.getSnapshotId() != null) {
            Optional<PredictionHistory> existing = repository.findBySnapshotId(request.getSnapshotId());
            if (existing.isPresent()) {
                log.info("Prediction already exists for snapshotId={}. Returning existing record id={}",
                        request.getSnapshotId(), existing.get().getId());
                return mapToDTO(existing.get());
            }
        }

        // 2. Invoke Python FastAPI ML endpoint
        MlPredictionResponseDTO mlResult = mlServiceClient.predict(request);

        // 3. Map inputs + ML outputs to JPA entity
        PredictionHistory entity = PredictionHistory.builder()
                .snapshotId(request.getSnapshotId())
                .mineId(request.getMineId())
                .groundTilt(request.getGroundTilt())
                .discontinuityAngle(request.getDiscontinuityAngle())
                .jointSpacing(request.getJointSpacing())
                .poreWaterPressure(request.getPoreWaterPressure())
                .vibrationRmr(request.getVibrationRmr())
                .rainfallMm(request.getRainfallMm())
                .predictedClass(mlResult.getPredictedClass())
                .hazardProbability(mlResult.getHazardProbability())
                .safeProbability(mlResult.getSafeProbability())
                .riskLevel(mlResult.getRiskLevel())
                .triggerAlert(mlResult.getTriggerAlert())
                .createdAt(LocalDateTime.now())
                .build();

        // 4. Persist to PostgreSQL, handling duplicate-key race condition safely
        try {
            PredictionHistory saved = repository.save(entity);
            log.info("Persisted prediction history record with id={}, snapshotId={}, mineId={}",
                    saved.getId(), saved.getSnapshotId(), saved.getMineId());
            return mapToDTO(saved);
        } catch (DataIntegrityViolationException ex) {
            if (request.getSnapshotId() != null) {
                log.warn("Concurrent duplicate insert detected for snapshotId={}. Fetching existing record.",
                        request.getSnapshotId());
                return repository.findBySnapshotId(request.getSnapshotId())
                        .map(this::mapToDTO)
                        .orElseThrow(() -> ex);
            }
            throw ex;
        }
    }

    /**
     * Returns full prediction history ordered from newest to oldest.
     */
    @Transactional(readOnly = true)
    public List<PredictionResponseDTO> getHistory() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns prediction history ordered from newest to oldest.
     * If limit is null, returns all records.
     * If limit is specified, validates 1 <= limit <= 100, and returns the top records using Pageable.
     *
     * @param limit The maximum number of records to retrieve (1 to 100).
     * @return List of PredictionResponseDTO.
     * @throws IllegalArgumentException if limit is not between 1 and 100.
     */
    @Transactional(readOnly = true)
    public List<PredictionResponseDTO> getHistory(Integer limit) {
        if (limit == null) {
            return getHistory();
        }
        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException("Limit must be between 1 and 100. Provided: " + limit);
        }
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Checks the health and connectivity of the Python ML FastAPI service.
     */
    public MlHealthResponseDTO checkMlHealth() {
        return mlServiceClient.checkHealth();
    }

    private PredictionResponseDTO mapToDTO(PredictionHistory entity) {
        return PredictionResponseDTO.builder()
                .id(entity.getId())
                .snapshotId(entity.getSnapshotId())
                .mineId(entity.getMineId())
                .groundTilt(entity.getGroundTilt())
                .discontinuityAngle(entity.getDiscontinuityAngle())
                .jointSpacing(entity.getJointSpacing())
                .poreWaterPressure(entity.getPoreWaterPressure())
                .vibrationRmr(entity.getVibrationRmr())
                .rainfallMm(entity.getRainfallMm())
                .predictedClass(entity.getPredictedClass())
                .hazardProbability(entity.getHazardProbability())
                .safeProbability(entity.getSafeProbability())
                .riskLevel(entity.getRiskLevel())
                .triggerAlert(entity.getTriggerAlert())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
