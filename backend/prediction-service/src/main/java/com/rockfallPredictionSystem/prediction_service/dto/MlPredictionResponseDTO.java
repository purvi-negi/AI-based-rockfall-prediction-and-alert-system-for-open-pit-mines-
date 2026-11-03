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
public class MlPredictionResponseDTO {

    @JsonProperty("predicted_class")
    private Integer predictedClass;

    @JsonProperty("raw_svm_class")
    private Integer rawSvmClass;

    @JsonProperty("effective_class")
    private String effectiveClass;

    @JsonProperty("decision_function")
    private Double decisionFunction;

    @JsonProperty("hazard_probability")
    private Double hazardProbability;

    @JsonProperty("safe_probability")
    private Double safeProbability;

    @JsonProperty("risk_level")
    private String riskLevel;

    @JsonProperty("trigger_alert")
    private Boolean triggerAlert;
}
