package com.healthguard.community.service;

import com.healthguard.community.entity.NotificationEntity;
import java.util.List;

public interface NotificationService {
    List<NotificationEntity> getNotificationsForUser(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role);
    long getUnreadCount(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role);
    NotificationEntity markAsRead(Long id);
    void markAllAsRead(Long headerUserId, String headerUserEmail, Long ashaWorkerId, String role);
    void deleteNotification(Long id);
    void triggerAutoNotifications(Long workerId, Long userId, String workerName, String village);
    NotificationEntity createHealthOfficerNotificationForReport(com.healthguard.community.entity.DiseaseReport report, String ashaWorkerName);
    void createAshaNotificationForReviewAction(com.healthguard.community.entity.DiseaseReport report, String action, String officerName);
    List<NotificationEntity> getHealthOfficerNotifications(Long userId);
    long getHealthOfficerUnreadCount(Long userId);
    NotificationEntity markOfficerNotificationAsRead(Long id);
    void markAllOfficerNotificationsAsRead(Long userId);
}
