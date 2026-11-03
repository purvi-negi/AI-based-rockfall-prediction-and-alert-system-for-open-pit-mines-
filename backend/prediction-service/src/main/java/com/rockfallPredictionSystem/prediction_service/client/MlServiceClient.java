package com.rockfallPredictionSystem.prediction_service.client;

import com.rockfallPredictionSystem.prediction_service.dto.MlHealthResponseDTO;
import com.rockfallPredictionSystem.prediction_service.dto.MlPredictionResponseDTO;
import com.rockfallPredictionSystem.prediction_service.dto.PredictionRequestDTO;
import com.rockfallPredictionSystem.prediction_service.exception.MlServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class MlServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MlServiceClient.class);

    private final RestClient mlRestClient;

    public MlServiceClient(RestClient mlRestClient) {
        this.mlRestClient = mlRestClient;
    }

    /**
     * Calls Python FastAPI POST /predict with geotechnical parameters.
     */
    public MlPredictionResponseDTO predict(PredictionRequestDTO request) {
        try {
            log.info("Sending prediction request to Python ML service: {}", request);
            MlPredictionResponseDTO response = mlRestClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MlPredictionResponseDTO.class);

            if (response == null) {
                throw new MlServiceException("Received empty response from Python ML service.", HttpStatus.BAD_GATEWAY);
            }

            log.info("Received prediction response: predicted_class={}, hazard_probability={}, risk_level={}",
                    response.getPredictedClass(), response.getHazardProbability(), response.getRiskLevel());
            return response;
        } catch (ResourceAccessException ex) {
            log.error("Failed to connect to Python ML service: {}", ex.getMessage());
            throw new MlServiceException(
                    "Unable to connect to Python ML service. Please ensure the FastAPI server is running.",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        } catch (RestClientResponseException ex) {
            log.error("Python ML service returned error status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new MlServiceException(
                    "Python ML service error: " + ex.getResponseBodyAsString(),
                    HttpStatus.valueOf(ex.getStatusCode().value())
            );
        } catch (MlServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error contacting Python ML service: {}", ex.getMessage(), ex);
            throw new MlServiceException(
                    "Unexpected error communicating with ML service: " + ex.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Calls Python FastAPI GET /health to check service availability and model status.
     */
    public MlHealthResponseDTO checkHealth() {
        try {
            log.info("Checking Python ML service health at GET /health");
            MlHealthResponseDTO response = mlRestClient.get()
                    .uri("/health")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(MlHealthResponseDTO.class);

            if (response == null) {
                throw new MlServiceException("Received empty health response from Python ML service.", HttpStatus.BAD_GATEWAY);
            }

            return response;
        } catch (ResourceAccessException ex) {
            log.error("ML service health check failed, service unreachable: {}", ex.getMessage());
            throw new MlServiceException(
                    "Python ML service is unreachable. Please verify that the FastAPI server is running.",
                    HttpStatus.SERVICE_UNAVAILABLE
            );
        } catch (RestClientResponseException ex) {
            log.error("ML service health check returned error status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new MlServiceException(
                    "Python ML service health check failed with status " + ex.getStatusCode(),
                    HttpStatus.valueOf(ex.getStatusCode().value())
            );
        } catch (MlServiceException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error during ML health check: {}", ex.getMessage(), ex);
            throw new MlServiceException(
                    "Unexpected error during ML health check: " + ex.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
