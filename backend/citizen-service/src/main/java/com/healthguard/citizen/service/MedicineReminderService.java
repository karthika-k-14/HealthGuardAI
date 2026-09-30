package com.healthguard.citizen.service;

import com.healthguard.citizen.entity.Citizen;
import com.healthguard.citizen.entity.MedicationHistory;
import com.healthguard.citizen.entity.MedicineReminder;
import com.healthguard.citizen.enums.NotificationPriority;
import com.healthguard.citizen.enums.NotificationType;
import com.healthguard.citizen.enums.ReminderStatus;
import com.healthguard.citizen.repository.CitizenRepository;
import com.healthguard.citizen.repository.MedicationHistoryRepository;
import com.healthguard.citizen.repository.MedicineReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MedicineReminderService {

    private final MedicineReminderRepository reminderRepository;
    private final MedicationHistoryRepository medicationHistoryRepository;
    private final CitizenRepository citizenRepository;
    private final NotificationService notificationService;

    /**
     * Resolves all valid identifier aliases for a citizen (both citizens.id and users.id)
     */
    public List<Long> getCitizenIds(Long idOrUserId) {
        List<Long> ids = new ArrayList<>();
        if (idOrUserId != null) {
            ids.add(idOrUserId);
            citizenRepository.findByUserId(idOrUserId).ifPresent(c -> {
                if (!ids.contains(c.getId())) ids.add(c.getId());
            });
            citizenRepository.findById(idOrUserId).ifPresent(c -> {
                if (c.getUserId() != null && !ids.contains(c.getUserId())) ids.add(c.getUserId());
            });
        }
        return ids.isEmpty() ? List.of(1L) : ids;
    }

    @Transactional
    public MedicineReminder createReminder(MedicineReminder reminder) {
        if (reminder.getStatus() == null) {
            reminder.setStatus(ReminderStatus.ACTIVE);
        }
        if (reminder.getReminderTime() == null || reminder.getReminderTime().isBlank()) {
            reminder.setReminderTime("08:00 AM");
        }
        if (reminder.getStartDate() == null) {
            reminder.setStartDate(LocalDate.now());
        }
        MedicineReminder saved = reminderRepository.save(reminder);

        // Check if status recorded today
        medicationHistoryRepository.findFirstByReminderIdAndDate(saved.getId(), LocalDate.now())
                .ifPresent(h -> saved.setTodayStatus(h.getStatus()));

        // Notification Integration: Medicine Due
        notificationService.createNotification(
                saved.getCitizenId(),
                "Medicine Due",
                "Medicine Reminder: " + saved.getMedicineName() + " is scheduled.",
                NotificationType.MEDICINE_REMINDER,
                NotificationPriority.MEDIUM
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public List<MedicineReminder> getRemindersByCitizenId(Long citizenId) {
        List<Long> ids = getCitizenIds(citizenId);
        List<MedicineReminder> reminders = reminderRepository.findByCitizenIdInOrderByStartDateDesc(ids);

        LocalDate today = LocalDate.now();
        for (MedicineReminder r : reminders) {
            medicationHistoryRepository.findFirstByReminderIdAndDate(r.getId(), today)
                    .ifPresentOrElse(
                            h -> r.setTodayStatus(h.getStatus()),
                            () -> r.setTodayStatus(null)
                    );
        }

        return reminders;
    }

    @Transactional(readOnly = true)
    public MedicineReminder getReminderById(Long id) {
        MedicineReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine reminder not found with id: " + id));

        medicationHistoryRepository.findFirstByReminderIdAndDate(reminder.getId(), LocalDate.now())
                .ifPresent(h -> reminder.setTodayStatus(h.getStatus()));

        return reminder;
    }

    @Transactional
    public MedicineReminder updateReminder(Long id, MedicineReminder details) {
        MedicineReminder reminder = getReminderById(id);
        reminder.setMedicineName(details.getMedicineName());
        reminder.setDosage(details.getDosage());
        reminder.setFrequency(details.getFrequency());
        if (details.getInstructions() != null) {
            reminder.setInstructions(details.getInstructions());
        }
        if (details.getStartDate() != null) {
            reminder.setStartDate(details.getStartDate());
        }
        if (details.getEndDate() != null) {
            reminder.setEndDate(details.getEndDate());
        }
        if (details.getReminderTime() != null && !details.getReminderTime().isBlank()) {
            reminder.setReminderTime(details.getReminderTime());
        }
        if (details.getStatus() != null) {
            reminder.setStatus(details.getStatus());
        }
        MedicineReminder saved = reminderRepository.save(reminder);

        medicationHistoryRepository.findFirstByReminderIdAndDate(saved.getId(), LocalDate.now())
                .ifPresent(h -> saved.setTodayStatus(h.getStatus()));

        return saved;
    }

    @Transactional
    public MedicineReminder markComplete(Long id) {
        MedicineReminder reminder = getReminderById(id);
        LocalDate today = LocalDate.now();

        // Prevent duplicate entries or conflicting statuses
        Optional<MedicationHistory> existing = medicationHistoryRepository.findFirstByReminderIdAndDate(id, today);
        if (existing.isPresent()) {
            reminder.setTodayStatus(existing.get().getStatus());
            return reminder;
        }

        // Save dose completion record in database
        MedicationHistory history = MedicationHistory.builder()
                .reminderId(reminder.getId())
                .citizenId(reminder.getCitizenId())
                .status("COMPLETED")
                .date(today)
                .timestamp(LocalDateTime.now())
                .build();
        medicationHistoryRepository.save(history);

        reminder.setTodayStatus("COMPLETED");

        // Notification Integration: Dose Completed
        notificationService.createNotification(
                reminder.getCitizenId(),
                "Dose Completed",
                "Dose Completed: " + reminder.getMedicineName() + " recorded as taken.",
                NotificationType.MEDICINE_REMINDER,
                NotificationPriority.LOW
        );

        return reminder;
    }

    @Transactional
    public MedicineReminder markMissed(Long id) {
        MedicineReminder reminder = getReminderById(id);
        LocalDate today = LocalDate.now();

        // Prevent duplicate entries or conflicting statuses
        Optional<MedicationHistory> existing = medicationHistoryRepository.findFirstByReminderIdAndDate(id, today);
        if (existing.isPresent()) {
            reminder.setTodayStatus(existing.get().getStatus());
            return reminder;
        }

        // Save missed record in database
        MedicationHistory history = MedicationHistory.builder()
                .reminderId(reminder.getId())
                .citizenId(reminder.getCitizenId())
                .status("MISSED")
                .date(today)
                .timestamp(LocalDateTime.now())
                .build();
        medicationHistoryRepository.save(history);

        reminder.setTodayStatus("MISSED");

        // Notification Integration: Medicine Missed
        notificationService.createNotification(
                reminder.getCitizenId(),
                "Medicine Missed",
                "Medicine Missed: " + reminder.getMedicineName() + " dose was missed.",
                NotificationType.MEDICINE_REMINDER,
                NotificationPriority.HIGH
        );

        return reminder;
    }

    @Transactional
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdherenceSummary(Long citizenId) {
        List<Long> ids = getCitizenIds(citizenId);

        // Scheduled Doses: calculate from all active medicine reminders for this citizen
        long scheduledDoses = reminderRepository.findByCitizenIdInAndStatus(ids, ReminderStatus.ACTIVE).size();
        if (scheduledDoses == 0) {
            // If active count is 0, total reminders count
            scheduledDoses = reminderRepository.findByCitizenIdInOrderByStartDateDesc(ids).size();
        }

        // Completed Doses: count from MedicationHistory table
        long completed = medicationHistoryRepository.countByCitizenIdInAndStatus(ids, "COMPLETED");

        // Missed Doses: count from MedicationHistory table
        long missed = medicationHistoryRepository.countByCitizenIdInAndStatus(ids, "MISSED");

        // Formula: Adherence % = (Completed Doses / (Completed Doses + Missed Doses)) * 100
        long totalRecordedDoses = completed + missed;
        double adherencePercent = (totalRecordedDoses > 0)
                ? ((double) completed / totalRecordedDoses) * 100.0
                : 0.0;
        double roundedAdherence = Math.round(adherencePercent * 10.0) / 10.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("citizenId", citizenId);
        summary.put("completedDoses", completed);
        summary.put("missedDoses", missed);
        summary.put("totalScheduledDoses", scheduledDoses);
        summary.put("adherencePercent", roundedAdherence);
        summary.put("adherencePercentage", roundedAdherence);
        summary.put("activeReminders", scheduledDoses);

        return summary;
    }
}
