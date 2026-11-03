package com.rockfallPredictionSystem.data_service.repository;

import com.rockfallPredictionSystem.data_service.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {

    long countByStatusIgnoreCase(String status);
}
