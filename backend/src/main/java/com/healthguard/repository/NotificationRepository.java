package com.healthguard.repository;

import com.healthguard.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    // Scopes a single-notification lookup to its owner, so one user can
    // never read/mark-read/delete another user's notification just by
    // guessing an id (same pattern as CitizenRepository#findByIdAndVillageId).
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    long countByRecipientIdAndReadFalse(Long recipientId);

    // ---- Analytics Module (Phase 12) -----------------------------------

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

