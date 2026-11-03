package com.rockfallPredictionSystem.prediction_service.exception;

import org.springframework.http.HttpStatus;

public class MlServiceException extends RuntimeException {

    private final HttpStatus status;

    public MlServiceException(String message) {
        super(message);
        this.status = HttpStatus.SERVICE_UNAVAILABLE;
    }

    public MlServiceException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.SERVICE_UNAVAILABLE;
    }

    public MlServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
