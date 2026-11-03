package com.rockfallPredictionSystem.data_service.controller;

import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotRequest;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotResponse;
import com.rockfallPredictionSystem.data_service.service.MonitoringSnapshotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/monitoring-snapshots")
public class MonitoringSnapshotController {

    private final MonitoringSnapshotService monitoringSnapshotService;

    public MonitoringSnapshotController(MonitoringSnapshotService monitoringSnapshotService) {
        this.monitoringSnapshotService = monitoringSnapshotService;
    }

    @PostMapping
    public ResponseEntity<MonitoringSnapshotResponse> saveSnapshot(@RequestBody MonitoringSnapshotRequest request) {
        MonitoringSnapshotResponse response = monitoringSnapshotService.saveSnapshot(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/predict")
    public ResponseEntity<PredictionResponse> predictSnapshot(@PathVariable Long id) {
        PredictionResponse response = monitoringSnapshotService.predictSnapshot(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mine/{mineId}/latest")
    public ResponseEntity<MonitoringSnapshotResponse> getLatestSnapshot(@PathVariable Long mineId) {
        MonitoringSnapshotResponse response = monitoringSnapshotService.getLatestSnapshot(mineId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mine/{mineId}")
    public ResponseEntity<List<MonitoringSnapshotResponse>> getSnapshotHistory(@PathVariable Long mineId) {
        List<MonitoringSnapshotResponse> history = monitoringSnapshotService.getSnapshotsByMineId(mineId);
        return ResponseEntity.ok(history);
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

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFoundException(NoSuchElementException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleResourceAccessException(ResourceAccessException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        body.put("error", "Service Unavailable");
        body.put("message", "Prediction Service is unavailable: " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<Map<String, Object>> handleRestClientResponseException(RestClientResponseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_GATEWAY.value());
        body.put("error", "Bad Gateway");
        body.put("message", "Prediction Service returned error: " + ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(IllegalStateException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_GATEWAY.value());
        body.put("error", "Bad Gateway");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_GATEWAY);
    }
}
