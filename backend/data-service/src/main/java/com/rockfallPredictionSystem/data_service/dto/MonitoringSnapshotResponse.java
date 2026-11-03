package com.rockfallPredictionSystem.data_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rockfallPredictionSystem.data_service.entity.MonitoringSnapshot;
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
public class MonitoringSnapshotResponse {

    private Long id;

    @JsonProperty("mineId")
    private Long mineId;

    @JsonProperty("groundTilt")
    private Double groundTilt;

    @JsonProperty("discontinuityAngle")
    private Double discontinuityAngle;

    @JsonProperty("jointSpacing")
    private Double jointSpacing;

    @JsonProperty("poreWaterPressure")
    private Double poreWaterPressure;

    @JsonProperty("vibrationRmr")
    private Double vibrationRmr;

    @JsonProperty("rainfallMm")
    private Double rainfallMm;

    @JsonProperty("recordedAt")
    private LocalDateTime recordedAt;

    public static MonitoringSnapshotResponse fromEntity(MonitoringSnapshot snapshot) {
        if (snapshot == null) {
            return null;
        }
        return MonitoringSnapshotResponse.builder()
                .id(snapshot.getId())
                .mineId(snapshot.getMine() != null ? snapshot.getMine().getId() : null)
                .groundTilt(snapshot.getGroundTilt())
                .discontinuityAngle(snapshot.getDiscontinuityAngle())
                .jointSpacing(snapshot.getJointSpacing())
                .poreWaterPressure(snapshot.getPoreWaterPressure())
                .vibrationRmr(snapshot.getVibrationRmr())
                .rainfallMm(snapshot.getRainfallMm())
                .recordedAt(snapshot.getRecordedAt())
                .build();
    }
}
