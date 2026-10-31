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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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
     */
    @Transactional
    public PredictionResponseDTO predictAndSave(PredictionRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Prediction request body cannot be null.");
        }
        request.validate();

        // 1. Invoke Python FastAPI ML endpoint
        MlPredictionResponseDTO mlResult = mlServiceClient.predict(request);

        // 2. Map inputs + ML outputs to JPA entity
        PredictionHistory entity = PredictionHistory.builder()
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

        // 3. Persist to PostgreSQL
        PredictionHistory saved = repository.save(entity);
        log.info("Persisted prediction history record with id={}", saved.getId());

        // 4. Return unified DTO
        return mapToDTO(saved);
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
     * Checks the health and connectivity of the Python ML FastAPI service.
     */
    public MlHealthResponseDTO checkMlHealth() {
        return mlServiceClient.checkHealth();
    }

    private PredictionResponseDTO mapToDTO(PredictionHistory entity) {
        return PredictionResponseDTO.builder()
                .id(entity.getId())
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
