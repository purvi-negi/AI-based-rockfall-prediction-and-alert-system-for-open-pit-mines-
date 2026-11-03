package com.rockfallPredictionSystem.data_service.entity;

/**
 * Represents the lifecycle status of a rockfall risk alert.
 * Allowed transitions: PENDING -> ACKNOWLEDGED -> RESOLVED.
 */
public enum AlertStatus {
    PENDING,
    ACKNOWLEDGED,
    RESOLVED
}

