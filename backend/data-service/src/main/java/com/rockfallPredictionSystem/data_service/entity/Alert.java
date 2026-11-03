package com.rockfallPredictionSystem.data_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mine_id", nullable = false)
    private Long mineId;

    @Column(name = "prediction_id", unique = true, nullable = false)
    private Long predictionId;

    @Column(name = "snapshot_id")
    private Long snapshotId;

    @Column(name = "risk_level", nullable = false, length = 32)
    private String riskLevel;

    @Column(name = "hazard_probability", nullable = false)
    private Double hazardProbability;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AlertStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = AlertStatus.PENDING;
        }
    }

    /**
     * Transitions alert status from PENDING to ACKNOWLEDGED.
     *
     * @throws IllegalStateException if current status is not PENDING.
     */
    public void acknowledge() {
        if (this.status == AlertStatus.ACKNOWLEDGED) {
            throw new IllegalStateException("Alert id=" + this.id + " is already ACKNOWLEDGED.");
        }
        if (this.status == AlertStatus.RESOLVED) {
            throw new IllegalStateException("Alert id=" + this.id + " is already RESOLVED and cannot be acknowledged.");
        }
        if (this.status != AlertStatus.PENDING) {
            throw new IllegalStateException("Cannot acknowledge alert with status: " + this.status + ". Only PENDING alerts can be acknowledged.");
        }
        this.status = AlertStatus.ACKNOWLEDGED;
        this.acknowledgedAt = LocalDateTime.now();
    }

    /**
     * Transitions alert status from ACKNOWLEDGED to RESOLVED.
     *
     * @throws IllegalStateException if current status is not ACKNOWLEDGED.
     */
    public void resolve() {
        if (this.status == AlertStatus.RESOLVED) {
            throw new IllegalStateException("Alert id=" + this.id + " is already RESOLVED.");
        }
        if (this.status == AlertStatus.PENDING) {
            throw new IllegalStateException("Cannot resolve alert with status: PENDING. Alert must be ACKNOWLEDGED before it can be RESOLVED.");
        }
        if (this.status != AlertStatus.ACKNOWLEDGED) {
            throw new IllegalStateException("Cannot resolve alert with status: " + this.status + ". Only ACKNOWLEDGED alerts can be resolved.");
        }
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }
}

