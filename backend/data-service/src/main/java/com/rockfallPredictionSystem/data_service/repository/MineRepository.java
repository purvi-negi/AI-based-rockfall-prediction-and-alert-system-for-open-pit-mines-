package com.rockfallPredictionSystem.data_service.repository;

import com.rockfallPredictionSystem.data_service.entity.Mine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MineRepository extends JpaRepository<Mine, Long> {
}
