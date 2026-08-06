package com.healthguard.service;

import com.healthguard.dto.BroadcastRequest;
import com.healthguard.dto.BroadcastResponse;
import com.healthguard.dto.NotificationResponse;
import com.healthguard.dto.SendNotificationRequest;
import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.Notification;
import com.healthguard.entity.Phc;
import com.healthguard.entity.User;
import com.healthguard.entity.Village;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.NotificationMapper;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.NotificationRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.UserRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Business logic for the Notification CRUD module: sending a notification
 * to a user (or broadcasting to every active user of a role), listing a
 * user's own notifications, marking one read, and deleting one. Also
 * covers the Broadcast Notification module ({@code /admin/notifications/broadcast}) -
 * sending one notification to every active user of a role, village, or PHC.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private static final String DEFAULT_TYPE = "info";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final VillageRepository villageRepository;
    private final PhcRepository phcRepository;
    private final NotificationMapper notificationMapper;

    // ---- Send Notification (Admin) --------------------------------------

    @Transactional
    public List<NotificationResponse> send(User sender, SendNotificationRequest request) {
        List<User> recipients;

        if (request.getRecipientUserId() != null) {
            User recipient = userRepository.findById(request.getRecipientUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with id: " + request.getRecipientUserId()));
            recipients = List.of(recipient);
        } else if (request.getRole() != null) {
            recipients = userRepository.findByRoleAndAccountStatus(request.getRole(), AccountStatus.ACTIVE);
            if (recipients.isEmpty()) {
                throw new BadRequestException("No active users found for role: " + request.getRole());
            }
        } else {
            throw new BadRequestException("Provide either recipientUserId or role");
        }

        String type = StringUtils.hasText(request.getType()) ? request.getType() : DEFAULT_TYPE;

        List<Notification> notifications = recipients.stream()
                .map(recipient -> Notification.builder()
                        .recipient(recipient)
                        .sender(sender)
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(type)
                        .category(request.getCategory())
                        .read(false)
                        .build())
                .toList();

        return notificationRepository.saveAll(notifications).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    // ---- Broadcast Notification (Admin) -----------------------------------

    @Transactional
    public BroadcastResponse broadcast(User sender, BroadcastRequest request) {
        if (request.getTargetType() == null) {
            throw new BadRequestException("targetType is required");
        }

        List<User> recipients;
        String targetLabel;

        switch (request.getTargetType()) {
            case ROLE -> {
                if (request.getRole() == null) {
                    throw new BadRequestException("role is required when targetType is ROLE");
                }
                recipients = userRepository.findByRoleAndAccountStatus(request.getRole(), AccountStatus.ACTIVE);
                targetLabel = request.getRole().name();
            }
            case VILLAGE -> {
                if (request.getVillageId() == null) {
                    throw new BadRequestException("villageId is required when targetType is VILLAGE");
                }
                Village village = villageRepository.findById(request.getVillageId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Village not found with id: " + request.getVillageId()));
                recipients = villageRecipients(village.getId());
                targetLabel = village.getVillageName();
            }
            case PHC -> {
                if (request.getPhcId() == null) {
                    throw new BadRequestException("phcId is required when targetType is PHC");
                }
                Phc phc = phcRepository.findById(request.getPhcId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "PHC not found with id: " + request.getPhcId()));
                recipients = phcRecipients(phc.getId());
                targetLabel = phc.getName();
            }
            default -> throw new BadRequestException("Unsupported targetType: " + request.getTargetType());
        }

        if (recipients.isEmpty()) {
            throw new BadRequestException("No active users found for the selected target");
        }

        String type = StringUtils.hasText(request.getType()) ? request.getType() : DEFAULT_TYPE;

        List<Notification> notifications = recipients.stream()
                .map(recipient -> Notification.builder()
                        .recipient(recipient)
                        .sender(sender)
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(type)
                        .category(request.getCategory())
                        .read(false)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);

        return BroadcastResponse.builder()
                .targetType(request.getTargetType())
                .targetLabel(targetLabel)
                .recipientCount(recipients.size())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(type)
                .category(request.getCategory())
                .sentAt(LocalDateTime.now())
                .build();
    }

    /**
     * Every active user based in a village: Citizens living there plus any
     * ASHA Worker assigned there. Health Officers and Pharmacists aren't
     * tied to a village in the current data model, so they aren't included.
     */
    private List<User> villageRecipients(Long villageId) {
        List<Citizen> citizens = citizenRepository.findByVillageId(villageId);
        List<AshaWorker> ashaWorkers = ashaWorkerRepository.findByAssignedVillageId(villageId);

        return Stream.concat(citizens.stream(), ashaWorkers.stream())
                .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                .map(user -> (User) user)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    /**
     * Every active ASHA Worker assigned to a PHC - currently the only role
     * with a direct PHC assignment in the data model.
     */
    private List<User> phcRecipients(Long phcId) {
        return ashaWorkerRepository.findByAssignedPhcId(phcId).stream()
                .filter(asha -> asha.getAccountStatus() == AccountStatus.ACTIVE)
                .map(asha -> (User) asha)
                .toList();
    }

    // ---- User Notifications ----------------------------------------------

    public List<NotificationResponse> getMyNotifications(User user) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    // ---- Mark Read ---------------------------------------------------------

    @Transactional
    public NotificationResponse markRead(User user, Long notificationId) {
        Notification notification = findOwnedOrThrow(user, notificationId);

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return notificationMapper.toResponse(notification);
    }

    // ---- Delete Notification ------------------------------------------------

    @Transactional
    public void deleteNotification(User user, Long notificationId) {
        Notification notification = findOwnedOrThrow(user, notificationId);
        notificationRepository.delete(notification);
    }

    private Notification findOwnedOrThrow(User user, Long notificationId) {
        return notificationRepository.findByIdAndRecipientId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
    }
}
