package com.rockfallPredictionSystem.prediction_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlHealthResponseDTO {

    private String status;

    @JsonProperty("model_loaded")
    private Boolean modelLoaded;
}
