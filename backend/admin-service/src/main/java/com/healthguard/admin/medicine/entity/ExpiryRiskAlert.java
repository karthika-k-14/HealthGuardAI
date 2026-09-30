package com.healthguard.admin.medicine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expiry_risk_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpiryRiskAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_id")
    private Long medicineId;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "days_remaining", nullable = false)
    private Integer daysRemaining;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "alert_date", updatable = false)
    private LocalDateTime alertDate;
}
