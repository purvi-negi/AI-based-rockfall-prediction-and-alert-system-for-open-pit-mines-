package com.rockfallPredictionSystem.prediction_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResponseDTO {

    private Long id;

    @JsonProperty("ground_tilt")
    private Double groundTilt;

    @JsonProperty("discontinuity_angle")
    private Double discontinuityAngle;

    @JsonProperty("joint_spacing")
    private Double jointSpacing;

    @JsonProperty("pore_water_pressure")
    private Double poreWaterPressure;

    @JsonProperty("vibration_rmr")
    private Double vibrationRmr;

    @JsonProperty("rainfall_mm")
    private Double rainfallMm;

    @JsonProperty("predicted_class")
    private Integer predictedClass;

    @JsonProperty("hazard_probability")
    private Double hazardProbability;

    @JsonProperty("safe_probability")
    private Double safeProbability;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("trigger_alert")
    private Boolean triggerAlert;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
