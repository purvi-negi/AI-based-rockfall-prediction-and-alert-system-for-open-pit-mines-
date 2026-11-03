package com.rockfallPredictionSystem.data_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    @JsonProperty("mine_stats")
    private MineStats mineStats;

    @JsonProperty("sensor_stats")
    private SensorStats sensorStats;

    @JsonProperty("latest_snapshots")
    private List<MonitoringSnapshotResponse> latestSnapshots;

    @JsonProperty("alert_stats")
    private AlertStats alertStats;

    @JsonProperty("latest_prediction")
    private PredictionResponse latestPrediction;

    @JsonProperty("recent_predictions")
    private List<PredictionResponse> recentPredictions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MineStats {
        private long total;
        private long active;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SensorStats {
        private long total;
        private long active;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertStats {
        private long total;
        private long pending;
        private long acknowledged;
        private long resolved;
    }
}

