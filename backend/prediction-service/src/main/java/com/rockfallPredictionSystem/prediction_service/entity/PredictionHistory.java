package com.rockfallPredictionSystem.prediction_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_id", unique = true)
    private Long snapshotId;

    @Column(name = "mine_id")
    private Long mineId;

    @Column(name = "ground_tilt", nullable = false)
    private Double groundTilt;

    @Column(name = "discontinuity_angle", nullable = false)
    private Double discontinuityAngle;

    @Column(name = "joint_spacing", nullable = false)
    private Double jointSpacing;

    @Column(name = "pore_water_pressure", nullable = false)
    private Double poreWaterPressure;

    @Column(name = "vibration_rmr", nullable = false)
    private Double vibrationRmr;

    @Column(name = "rainfall_mm", nullable = false)
    private Double rainfallMm;

    @Column(name = "predicted_class", nullable = false)
    private Integer predictedClass;

    @Column(name = "raw_svm_class")
    private Integer rawSvmClass;

    @Column(name = "effective_class", length = 32)
    private String effectiveClass;

    @Column(name = "decision_function")
    private Double decisionFunction;

    @Column(name = "hazard_probability", nullable = false)
    private Double hazardProbability;

    @Column(name = "safe_probability", nullable = false)
    private Double safeProbability;

    @Column(name = "risk_level", nullable = false, length = 32)
    private String riskLevel;

    @Column(name = "trigger_alert", nullable = false)
    private Boolean triggerAlert;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
