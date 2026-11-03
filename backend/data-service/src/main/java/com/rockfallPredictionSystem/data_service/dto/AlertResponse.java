package com.rockfallPredictionSystem.data_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rockfallPredictionSystem.data_service.entity.Alert;
import com.rockfallPredictionSystem.data_service.entity.AlertStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertResponse {

    private Long id;

    @JsonProperty("mine_id")
    private Long mineId;

    @JsonProperty("prediction_id")
    private Long predictionId;

    @JsonProperty("snapshot_id")
    private Long snapshotId;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("hazard_probability")
    private Double hazardProbability;

    private String message;

    private AlertStatus status;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @JsonProperty("resolved_at")
    private LocalDateTime resolvedAt;

    public static AlertResponse fromEntity(Alert alert) {
        if (alert == null) {
            return null;
        }
        return AlertResponse.builder()
                .id(alert.getId())
                .mineId(alert.getMineId())
                .predictionId(alert.getPredictionId())
                .snapshotId(alert.getSnapshotId())
                .riskLevel(alert.getRiskLevel())
                .hazardProbability(alert.getHazardProbability())
                .message(alert.getMessage())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}

