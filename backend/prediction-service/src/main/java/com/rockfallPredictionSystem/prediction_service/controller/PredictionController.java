package com.rockfallPredictionSystem.prediction_service.controller;

import com.rockfallPredictionSystem.prediction_service.dto.MlHealthResponseDTO;
import com.rockfallPredictionSystem.prediction_service.dto.PredictionRequestDTO;
import com.rockfallPredictionSystem.prediction_service.dto.PredictionResponseDTO;
import com.rockfallPredictionSystem.prediction_service.service.PredictionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * POST /api/predictions/predict
     * Accepts 6 geotechnical inputs, invokes the ML model, persists prediction history,
     * and returns the complete result.
     */
    @PostMapping("/predict")
    public ResponseEntity<PredictionResponseDTO> predict(@RequestBody PredictionRequestDTO request) {
        PredictionResponseDTO response = predictionService.predictAndSave(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/predictions/history
     * Returns stored rockfall predictions ordered chronologically (newest first).
     * Supports optional 'limit' query parameter (between 1 and 100).
     */
    @GetMapping("/history")
    public ResponseEntity<List<PredictionResponseDTO>> getHistory(
            @RequestParam(required = false) Integer limit
    ) {
        List<PredictionResponseDTO> history = predictionService.getHistory(limit);
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/predictions/ml-health
     * Checks if the separate Python FastAPI ML service is reachable and has the model loaded.
     */
    @GetMapping("/ml-health")
    public ResponseEntity<MlHealthResponseDTO> checkMlHealth() {
        MlHealthResponseDTO health = predictionService.checkMlHealth();
        return ResponseEntity.ok(health);
    }
}
