package com.healthguard.citizen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_history", indexes = {
        @Index(name = "idx_med_history_citizen", columnList = "citizen_id"),
        @Index(name = "idx_med_history_reminder_date", columnList = "reminder_id, date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reminder_id", nullable = false)
    private Long reminderId;

    @Column(name = "citizen_id", nullable = false)
    private Long citizenId;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // COMPLETED or MISSED

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
