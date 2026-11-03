package com.rockfallPredictionSystem.data_service.client;

import com.rockfallPredictionSystem.data_service.client.dto.PredictionRequest;
import com.rockfallPredictionSystem.data_service.client.dto.PredictionResponse;
import com.rockfallPredictionSystem.data_service.dto.MonitoringSnapshotResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Component
public class PredictionServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PredictionServiceClient.class);

    private final RestClient restClient;
    private final String baseUrl;

    public PredictionServiceClient(
            @Value("${prediction.service.base-url:http://localhost:8082}") String baseUrl
    ) {
        this.baseUrl = baseUrl;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Sends a saved monitoring snapshot to Prediction Service for ML inference and persistence.
     *
     * @param snapshot The saved monitoring snapshot containing a valid database-generated ID.
     * @return The PredictionResponse containing ML classification and risk assessment.
     */
    public PredictionResponse predict(MonitoringSnapshotResponse snapshot) {
        if (snapshot == null || snapshot.getId() == null) {
            throw new IllegalArgumentException("Cannot request prediction for null or unsaved snapshot.");
        }

        PredictionRequest request = PredictionRequest.builder()
                .snapshotId(snapshot.getId())
                .mineId(snapshot.getMineId())
                .groundTilt(snapshot.getGroundTilt())
                .discontinuityAngle(snapshot.getDiscontinuityAngle())
                .jointSpacing(snapshot.getJointSpacing())
                .poreWaterPressure(snapshot.getPoreWaterPressure())
                .vibrationRmr(snapshot.getVibrationRmr())
                .rainfallMm(snapshot.getRainfallMm())
                .build();

        return sendPrediction(request);
    }

    /**
     * Low-level method to send a PredictionRequest to POST /api/predictions/predict.
     */
    public PredictionResponse sendPrediction(PredictionRequest request) {
        Long snapshotId = request != null ? request.getSnapshotId() : null;
        try {
            log.info("Sending snapshot id={} (mineId={}) to Prediction Service ({}/api/predictions/predict)",
                    snapshotId, request != null ? request.getMineId() : null, baseUrl);

            PredictionResponse response = restClient.post()
                    .uri("/api/predictions/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(PredictionResponse.class);

            if (response != null) {
                log.info("Prediction Service responded for snapshot id={}: predictedClass={}, riskLevel={}, hazardProbability={}",
                        snapshotId, response.getPredictedClass(), response.getRiskLevel(), response.getHazardProbability());
            } else {
                log.warn("Received empty response from Prediction Service for snapshot id={}", snapshotId);
            }

            return response;
        } catch (ResourceAccessException ex) {
            log.error("Prediction Service is unavailable at {} for snapshot id={}: {}",
                    baseUrl, snapshotId, ex.getMessage());
            throw ex;
        } catch (RestClientResponseException ex) {
            log.error("Prediction Service returned error status {} for snapshot id={}: {}",
                    ex.getStatusCode(), snapshotId, ex.getResponseBodyAsString());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error contacting Prediction Service for snapshot id={}: {}",
                    snapshotId, ex.getMessage(), ex);
            throw ex;
        }
    }

    /**
     * Retrieves recent prediction history records from Prediction Service.
     * Gracefully catches connectivity and response errors and returns an empty list without fabricating data.
     *
     * @param limit The maximum number of records to retrieve (between 1 and 100).
     * @return List of recent PredictionResponse records, or empty list if unavailable.
     */
    public List<PredictionResponse> getRecentPredictions(int limit) {
        try {
            log.info("Fetching recent predictions from Prediction Service ({}/api/predictions/history?limit={})", baseUrl, limit);

            List<PredictionResponse> responses = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/predictions/history")
                            .queryParam("limit", limit)
                            .build())
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<PredictionResponse>>() {});

            return responses != null ? responses : Collections.emptyList();
        } catch (ResourceAccessException ex) {
            log.warn("Prediction Service is unavailable at {} while fetching recent predictions: {}", baseUrl, ex.getMessage());
            return Collections.emptyList();
        } catch (RestClientResponseException ex) {
            log.warn("Prediction Service returned error status {} while fetching recent predictions: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return Collections.emptyList();
        } catch (Exception ex) {
            log.warn("Unexpected error fetching recent predictions from Prediction Service: {}", ex.getMessage());
            return Collections.emptyList();
        }
    }
}
