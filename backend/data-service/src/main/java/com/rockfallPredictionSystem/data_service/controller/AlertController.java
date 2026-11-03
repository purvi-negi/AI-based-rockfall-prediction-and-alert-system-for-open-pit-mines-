package com.rockfallPredictionSystem.data_service.controller;

import com.rockfallPredictionSystem.data_service.dto.AlertResponse;
import com.rockfallPredictionSystem.data_service.entity.AlertStatus;
import com.rockfallPredictionSystem.data_service.service.AlertService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * GET /api/alerts
     * Retrieves all rockfall risk alerts ordered by creation date descending.
     */
    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAllAlerts() {
        List<AlertResponse> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * GET /api/alerts/mine/{mineId}
     * Retrieves all alerts for a specific mine ordered by creation date descending.
     */
    @GetMapping("/mine/{mineId}")
    public ResponseEntity<List<AlertResponse>> getAlertsByMine(@PathVariable Long mineId) {
        List<AlertResponse> alerts = alertService.getAlertsByMineId(mineId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * GET /api/alerts/status/{status}
     * Retrieves all alerts matching the specified status (PENDING, ACKNOWLEDGED, RESOLVED).
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AlertResponse>> getAlertsByStatus(@PathVariable String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Alert status cannot be null or blank.");
        }
        AlertStatus alertStatus;
        try {
            alertStatus = AlertStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid alert status: '" + status + "'. Allowed values are: PENDING, ACKNOWLEDGED, RESOLVED.");
        }
        List<AlertResponse> alerts = alertService.getAlertsByStatus(alertStatus);
        return ResponseEntity.ok(alerts);
    }

    /**
     * PUT /api/alerts/{id}/acknowledge
     * Transitions an alert from PENDING to ACKNOWLEDGED.
     */
    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<AlertResponse> acknowledgeAlert(@PathVariable Long id) {
        AlertResponse response = alertService.acknowledgeAlert(id);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/alerts/{id}/resolve
     * Transitions an alert from ACKNOWLEDGED to RESOLVED.
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<AlertResponse> resolveAlert(@PathVariable Long id) {
        AlertResponse response = alertService.resolveAlert(id);
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NoSuchElementException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Invalid State Transition");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}

