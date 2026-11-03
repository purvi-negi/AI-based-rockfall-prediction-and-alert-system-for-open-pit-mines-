package com.rockfallPredictionSystem.data_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "monitoring_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonitoringSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mine_id", nullable = false)
    private Mine mine;

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

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        if (this.recordedAt == null) {
            this.recordedAt = LocalDateTime.now();
        }
    }
}
