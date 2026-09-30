package com.healthguard.community.repository;

import com.healthguard.community.entity.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {

    List<EmergencyAlert> findByAssignedAshaWorkerIdOrderByCreatedAtDesc(Long ashaId);

    List<EmergencyAlert> findAllByOrderByCreatedAtDesc();

    List<EmergencyAlert> findByStatusOrderByCreatedAtDesc(String status);

    List<EmergencyAlert> findByUrgencyLevelOrderByCreatedAtDesc(String urgencyLevel);

    List<EmergencyAlert> findByStatusAndCreatedAtBefore(String status, LocalDateTime threshold);

    long countByStatus(String status);

    long countByUrgencyLevel(String urgencyLevel);

    long countByStatusNot(String status);

    // Duplicate alert check: active alert for this citizen in the last 24 hours
    Optional<EmergencyAlert> findFirstByCitizenIdAndStatusNotAndCreatedAtAfterOrderByCreatedAtDesc(
            Long citizenId, String status, LocalDateTime since
    );

    List<EmergencyAlert> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    @Query("SELECT e FROM EmergencyAlert e WHERE e.urgencyLevel = 'CRITICAL' OR e.status = 'ESCALATED' OR (e.status = 'PENDING' AND e.createdAt < :pendingThreshold) ORDER BY e.createdAt DESC")
    List<EmergencyAlert> findOfficerAlertFeed(@Param("pendingThreshold") LocalDateTime pendingThreshold);
}
