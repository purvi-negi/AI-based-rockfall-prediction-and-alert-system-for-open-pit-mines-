package com.rockfallPredictionSystem.data_service.repository;

import com.rockfallPredictionSystem.data_service.entity.MonitoringSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonitoringSnapshotRepository extends JpaRepository<MonitoringSnapshot, Long> {

    Optional<MonitoringSnapshot> findFirstByMineIdOrderByRecordedAtDesc(Long mineId);

    List<MonitoringSnapshot> findByMineIdOrderByRecordedAtDesc(Long mineId);

    /**
     * Retrieves the latest monitoring snapshot for each mine ordered by mine ID.
     */
    @Query("SELECT s FROM MonitoringSnapshot s JOIN FETCH s.mine WHERE s.id IN " +
           "(SELECT MAX(s2.id) FROM MonitoringSnapshot s2 GROUP BY s2.mine.id) " +
           "ORDER BY s.mine.id ASC")
    List<MonitoringSnapshot> findLatestSnapshotsPerMine();
}
