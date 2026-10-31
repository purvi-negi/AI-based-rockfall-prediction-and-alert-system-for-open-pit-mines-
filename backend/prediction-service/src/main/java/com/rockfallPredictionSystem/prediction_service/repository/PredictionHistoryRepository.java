package com.rockfallPredictionSystem.prediction_service.repository;

import com.rockfallPredictionSystem.prediction_service.entity.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {

    /**
     * Retrieve all prediction history records in descending chronological order.
     */
    List<PredictionHistory> findAllByOrderByCreatedAtDesc();
}
