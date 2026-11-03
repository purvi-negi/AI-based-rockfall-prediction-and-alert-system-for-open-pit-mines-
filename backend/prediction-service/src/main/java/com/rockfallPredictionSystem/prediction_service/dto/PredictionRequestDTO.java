package com.rockfallPredictionSystem.prediction_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionRequestDTO {

    @JsonProperty("snapshot_id")
    @JsonAlias({"snapshotId"})
    private Long snapshotId;

    @JsonProperty("mine_id")
    @JsonAlias({"mineId"})
    private Long mineId;

    @JsonProperty("ground_tilt")
    @JsonAlias({"groundTilt"})
    private Double groundTilt;

    @JsonProperty("discontinuity_angle")
    @JsonAlias({"discontinuityAngle"})
    private Double discontinuityAngle;

    @JsonProperty("joint_spacing")
    @JsonAlias({"jointSpacing"})
    private Double jointSpacing;

    @JsonProperty("pore_water_pressure")
    @JsonAlias({"poreWaterPressure"})
    private Double poreWaterPressure;

    @JsonProperty("vibration_rmr")
    @JsonAlias({"vibrationRmr"})
    private Double vibrationRmr;

    @JsonProperty("rainfall_mm")
    @JsonAlias({"rainfallMm"})
    private Double rainfallMm;

    /**
     * Validates that all six geotechnical inputs are present and finite numbers.
     */
    public void validate() {
        validateField("ground_tilt", groundTilt);
        validateField("discontinuity_angle", discontinuityAngle);
        validateField("joint_spacing", jointSpacing);
        validateField("pore_water_pressure", poreWaterPressure);
        validateField("vibration_rmr", vibrationRmr);
        validateField("rainfall_mm", rainfallMm);
    }

    private void validateField(String fieldName, Double value) {
        if (value == null) {
            throw new IllegalArgumentException("Field '" + fieldName + "' is required and cannot be null.");
        }
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            throw new IllegalArgumentException("Field '" + fieldName + "' must be a finite numeric value.");
        }
    }
}
