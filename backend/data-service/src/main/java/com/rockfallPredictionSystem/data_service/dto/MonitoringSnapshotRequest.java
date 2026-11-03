package com.rockfallPredictionSystem.data_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringSnapshotRequest {

    @JsonProperty("mineId")
    @JsonAlias({"mine_id"})
    private Long mineId;

    @JsonProperty("groundTilt")
    @JsonAlias({"ground_tilt"})
    private Double groundTilt;

    @JsonProperty("discontinuityAngle")
    @JsonAlias({"discontinuity_angle"})
    private Double discontinuityAngle;

    @JsonProperty("jointSpacing")
    @JsonAlias({"joint_spacing"})
    private Double jointSpacing;

    @JsonProperty("poreWaterPressure")
    @JsonAlias({"pore_water_pressure"})
    private Double poreWaterPressure;

    @JsonProperty("vibrationRmr")
    @JsonAlias({"vibration_rmr"})
    private Double vibrationRmr;

    @JsonProperty("rainfallMm")
    @JsonAlias({"rainfall_mm"})
    private Double rainfallMm;
}
