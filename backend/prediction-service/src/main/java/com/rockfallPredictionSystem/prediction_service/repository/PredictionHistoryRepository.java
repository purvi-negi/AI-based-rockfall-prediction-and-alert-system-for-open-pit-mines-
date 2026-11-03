package com.rockfallPredictionSystem.prediction_service.repository;

import com.rockfallPredictionSystem.prediction_service.entity.PredictionHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionHistoryRepository extends JpaRepository<PredictionHistory, Long> {

    /**
     * Retrieve all prediction history records in descending chronological order.
     */
    List<PredictionHistory> findAllByOrderByCreatedAtDesc();

    /**
     * Retrieve paginated prediction history records in descending chronological order.
     */
    List<PredictionHistory> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Find an existing prediction record by its monitoring snapshot ID.
     */
    Optional<PredictionHistory> findBySnapshotId(Long snapshotId);

    /**
     * Check if a prediction has already been generated for the given snapshot ID.
     */
    boolean existsBySnapshotId(Long snapshotId);
}
