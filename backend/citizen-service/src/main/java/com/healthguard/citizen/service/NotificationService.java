package com.healthguard.citizen.service;

import com.healthguard.citizen.entity.Notification;
import com.healthguard.citizen.enums.NotificationPriority;
import com.healthguard.citizen.enums.NotificationType;
import com.healthguard.citizen.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Long userId, String title, String message, NotificationType type, NotificationPriority priority) {
        return createNotification(userId, title, message, type, priority, null);
    }

    @Transactional
    public Notification createNotification(Long userId, String title, String message, NotificationType type, NotificationPriority priority, String role) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type : NotificationType.SYSTEM)
                .priority(priority != null ? priority : NotificationPriority.MEDIUM)
                .role(role != null ? role.toUpperCase() : "CITIZEN")
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getNotificationsByUserIdAndRole(Long userId, String role) {
        String cleanRole = role != null ? role.trim().toUpperCase() : "CITIZEN";
        if (cleanRole.contains("OFFICER")) {
            return notificationRepository.findByUserIdOrRole(userId, "HEALTH_OFFICER");
        }
        if (userId != null) {
            return notificationRepository.findByUserIdAndRole(userId, cleanRole);
        }
        return java.util.Collections.emptyList();
    }

    public long countUnreadByUserIdAndRole(Long userId, String role) {
        String cleanRole = role != null ? role.trim().toUpperCase() : "CITIZEN";
        if (cleanRole.contains("OFFICER")) {
            return notificationRepository.countUnreadByUserIdOrRole(userId, "HEALTH_OFFICER");
        }
        if (userId != null) {
            return notificationRepository.countUnreadByUserIdAndRole(userId, cleanRole);
        }
        return 0L;
    }

    public Page<Notification> getNotificationsByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    public Page<Notification> getUnreadNotificationsByUserId(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
    }

    public long countUnreadByUserId(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        return unread != null ? unread.size() : 0L;
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        if (userId != null) {
            List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            for (Notification n : unread) {
                n.setIsRead(true);
            }
            notificationRepository.saveAll(unread);
        }
    }

    @Transactional
    public void markAllAsReadByRole(Long userId, String role) {
        if (userId != null) {
            notificationRepository.markAllAsReadForUserIdAndRole(userId, role != null ? role.toUpperCase() : "CITIZEN");
        }
    }

    @Transactional
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification markAsRead(Long id, Long currentUserId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        if (currentUserId != null && !currentUserId.equals(notification.getUserId())) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to modify this notification");
        }
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    @Transactional
    public void deleteNotification(Long id, Long currentUserId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        if (currentUserId != null && !currentUserId.equals(notification.getUserId())) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to delete this notification");
        }
        notificationRepository.delete(notification);
    }
}
