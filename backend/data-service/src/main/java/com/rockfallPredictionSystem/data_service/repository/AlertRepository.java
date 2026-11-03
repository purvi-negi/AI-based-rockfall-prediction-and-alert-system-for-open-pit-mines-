package com.rockfallPredictionSystem.data_service.repository;

import com.rockfallPredictionSystem.data_service.entity.Alert;
import com.rockfallPredictionSystem.data_service.entity.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    boolean existsByPredictionId(Long predictionId);

    Optional<Alert> findByPredictionId(Long predictionId);

    List<Alert> findByMineIdOrderByCreatedAtDesc(Long mineId);

    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    List<Alert> findByMineIdAndStatusOrderByCreatedAtDesc(Long mineId, AlertStatus status);

    List<Alert> findAllByOrderByCreatedAtDesc();

    long countByStatus(AlertStatus status);
}

