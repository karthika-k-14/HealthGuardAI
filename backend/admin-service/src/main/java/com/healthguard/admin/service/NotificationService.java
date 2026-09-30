package com.healthguard.admin.service;

import com.healthguard.admin.entity.NotificationEntity;
import com.healthguard.admin.enums.NotificationType;
import com.healthguard.admin.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationEntity createNotification(String title, String message, String type) {
        if (notificationRepository.existsByTitleAndMessage(title, message)) {
            log.info("Duplicate notification prevented for Title: '{}', Message: '{}'", title, message);
            return null;
        }

        try {
            NotificationEntity notification = NotificationEntity.builder()
                    .userId(1L)
                    .title(title)
                    .message(message)
                    .type(type != null ? type : NotificationType.SYSTEM.name())
                    .priority("HIGH")
                    .isRead(false)
                    .build();

            NotificationEntity saved = notificationRepository.save(notification);
            log.info("Notification created [ID: {}]: Title='{}', Type='{}'", saved.getId(), title, type);
            return saved;
        } catch (Exception e) {
            log.warn("Failed to create notification: {}. Continuing operation.", e.getMessage());
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationEntity> getAdminNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }
}
