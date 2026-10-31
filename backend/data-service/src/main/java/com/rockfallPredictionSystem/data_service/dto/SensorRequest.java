package com.rockfallPredictionSystem.data_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SensorRequest {

    private String sensorName;
    private String sensorType;
    private String status;
    private Long mineId;
}
