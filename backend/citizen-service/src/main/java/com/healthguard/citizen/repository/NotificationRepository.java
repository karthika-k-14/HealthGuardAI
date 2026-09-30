package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndIsReadFalse(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND (:role IS NULL OR UPPER(n.role) = UPPER(:role)) ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND (:role IS NULL OR UPPER(n.role) = UPPER(:role)) AND n.isRead = false")
    long countUnreadByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND (:role IS NULL OR UPPER(n.role) = UPPER(:role)) AND n.isRead = false")
    int markAllAsReadForUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT n FROM Notification n WHERE (n.userId = :userId OR (:role IS NOT NULL AND UPPER(n.role) = UPPER(:role))) ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.userId = :userId OR (:role IS NOT NULL AND UPPER(n.role) = UPPER(:role))) AND n.isRead = false")
    long countUnreadByUserIdOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE (n.userId = :userId OR (:role IS NOT NULL AND UPPER(n.role) = UPPER(:role))) AND n.isRead = false")
    int markAllAsReadForUserIdOrRole(@Param("userId") Long userId, @Param("role") String role);
}
