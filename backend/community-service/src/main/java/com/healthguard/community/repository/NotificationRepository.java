package com.healthguard.community.repository;

import com.healthguard.community.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    @Query("SELECT n FROM NotificationEntity n WHERE ((n.userId = :userId) OR (:workerId IS NOT NULL AND n.userId = :workerId)) AND UPPER(n.role) = UPPER(:role) ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdOrWorkerIdAndRole(@Param("userId") Long userId, @Param("workerId") Long workerId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE ((n.userId = :userId) OR (:workerId IS NOT NULL AND n.userId = :workerId)) AND UPPER(n.role) = UPPER(:role) AND n.isRead = false")
    long countUnreadByUserIdOrWorkerIdAndRole(@Param("userId") Long userId, @Param("workerId") Long workerId, @Param("role") String role);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE ((n.userId = :userId) OR (:workerId IS NOT NULL AND n.userId = :workerId)) AND UPPER(n.role) = UPPER(:role) AND n.isRead = false")
    int markAllAsReadForUserAndRole(@Param("userId") Long userId, @Param("workerId") Long workerId, @Param("role") String role);

    @Query("SELECT n FROM NotificationEntity n WHERE ((n.userId = :userId) OR UPPER(n.role) = UPPER(:role)) AND UPPER(n.role) = UPPER(:role) ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT n FROM NotificationEntity n WHERE ((n.userId = :userId) OR UPPER(n.role) = UPPER(:role)) AND UPPER(n.role) = UPPER(:role) ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdAndRoleOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE ((n.userId = :userId) OR UPPER(n.role) = UPPER(:role)) AND UPPER(n.role) = UPPER(:role) AND n.isRead = false")
    long countUnreadByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE ((n.userId = :userId) OR UPPER(n.role) = UPPER(:role)) AND UPPER(n.role) = UPPER(:role) AND n.isRead = false")
    int markAllAsReadForUserOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE ((n.userId = :userId) OR UPPER(n.role) = UPPER(:role)) AND UPPER(n.role) = UPPER(:role) AND n.isRead = false")
    int markAllAsReadByUserIdAndRole(@Param("userId") Long userId, @Param("role") String role);

    // Legacy fallback queries
    @Query("SELECT n FROM NotificationEntity n WHERE (n.userId = :userId OR (:workerId IS NOT NULL AND n.userId = :workerId)) ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdOrWorkerId(@Param("userId") Long userId, @Param("workerId") Long workerId);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE (n.userId = :userId OR (:workerId IS NOT NULL AND n.userId = :workerId)) AND n.isRead = false")
    long countUnreadByUserIdOrWorkerId(@Param("userId") Long userId, @Param("workerId") Long workerId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE (n.userId = :userId OR (:workerId IS NOT NULL AND n.userId = :workerId)) AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId, @Param("workerId") Long workerId);

    @Query("SELECT n FROM NotificationEntity n WHERE (n.userId = :userId OR (:role IS NOT NULL AND UPPER(n.role) = UPPER(:role))) ORDER BY n.createdAt DESC")
    List<NotificationEntity> findByUserIdOrRole(@Param("userId") Long userId, @Param("role") String role);

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE (n.userId = :userId OR (:role IS NOT NULL AND UPPER(n.role) = UPPER(:role))) AND n.isRead = false")
    long countUnreadByUserIdOrRole(@Param("userId") Long userId, @Param("role") String role);

    boolean existsByUserIdAndReferenceTypeAndReferenceId(Long userId, String referenceType, String referenceId);

    boolean existsByReferenceTypeAndReferenceIdAndRole(String referenceType, String referenceId, String role);
}
