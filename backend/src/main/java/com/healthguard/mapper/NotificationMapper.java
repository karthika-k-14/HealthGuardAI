package com.healthguard.mapper;

import com.healthguard.dto.NotificationResponse;
import com.healthguard.entity.Notification;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link Notification} and its DTOs for the Notification
 * CRUD module.
 */
@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .uuid(notification.getUuid())
                .recipientUserId(notification.getRecipient().getId())
                .recipientName(notification.getRecipient().getFirstName() + " " + notification.getRecipient().getLastName())
                .senderUserId(notification.getSender() != null ? notification.getSender().getId() : null)
                .senderName(notification.getSender() != null
                        ? notification.getSender().getFirstName() + " " + notification.getSender().getLastName()
                        : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .category(notification.getCategory())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
