package com.healthguard.admin.repository;

import com.healthguard.admin.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<NotificationEntity> findAllByOrderByCreatedAtDesc();
    boolean existsByTitleAndMessage(String title, String message);
    List<NotificationEntity> findByTypeInOrderByCreatedAtDesc(java.util.Collection<String> types);
    List<NotificationEntity> findByUserIdAndTypeInOrderByCreatedAtDesc(Long userId, java.util.Collection<String> types);
    java.util.Optional<NotificationEntity> findFirstByTitleAndType(String title, String type);
}
