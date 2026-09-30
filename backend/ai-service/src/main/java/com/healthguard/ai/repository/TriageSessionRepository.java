package com.healthguard.ai.repository;

import com.healthguard.ai.entity.TriageSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TriageSessionRepository extends JpaRepository<TriageSession, Long> {

    Optional<TriageSession> findBySessionUuid(String sessionUuid);

    Optional<TriageSession> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);

    Page<TriageSession> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    Page<TriageSession> findByEmergencyAlertTrueOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT t FROM TriageSession t WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(t.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.riskLevel) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.sessionUuid) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<TriageSession> searchSessions(@Param("keyword") String keyword, Pageable pageable);
}

