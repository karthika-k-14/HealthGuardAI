package com.healthguard.admin.medicine.service;

import com.healthguard.admin.medicine.entity.ExpiryRiskAlert;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.repository.ExpiryRiskAlertRepository;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpiryRiskService {

    private final MedicineRepository medicineRepository;
    private final ExpiryRiskAlertRepository expiryAlertRepository;

    @Transactional
    public List<ExpiryRiskAlert> assessAndStoreExpiryRisks() {
        log.info("Running daily Expiry Risk Assessment engine...");
        List<Medicine> medicines = medicineRepository.findAll();
        LocalDate today = LocalDate.now();
        List<ExpiryRiskAlert> activeAlerts = new ArrayList<>();

        expiryAlertRepository.deleteAllInBatch();

        for (Medicine med : medicines) {
            if (med.getExpiryDate() == null) continue;

            long daysRemaining = ChronoUnit.DAYS.between(today, med.getExpiryDate());
            int days = (int) daysRemaining;

            String riskLevel;
            if (days <= 0) {
                riskLevel = "EXPIRED";
            } else if (days <= 30) {
                riskLevel = "CRITICAL";
            } else if (days <= 60) {
                riskLevel = "HIGH";
            } else if (days <= 90) {
                riskLevel = "MEDIUM";
            } else {
                riskLevel = "LOW";
            }

            String medName = med.getMedicineName() != null ? med.getMedicineName() : med.getName();
            String batch = med.getBatchNumber() != null ? med.getBatchNumber() : "BATCH-" + med.getId();
            int qty = med.getQuantity() != null ? med.getQuantity() : 0;

            ExpiryRiskAlert alert = ExpiryRiskAlert.builder()
                    .medicineId(med.getId())
                    .medicineName(medName)
                    .batchNumber(batch)
                    .quantity(qty)
                    .expiryDate(med.getExpiryDate())
                    .daysRemaining(days)
                    .riskLevel(riskLevel)
                    .status("ACTIVE")
                    .build();

            activeAlerts.add(alert);
        }

        List<ExpiryRiskAlert> saved = expiryAlertRepository.saveAll(activeAlerts);
        log.info("Completed Expiry Risk Assessment. Created {} alerts.", saved.size());
        return saved;
    }

    public List<ExpiryRiskAlert> getActiveAlerts() {
        List<ExpiryRiskAlert> list = expiryAlertRepository.findByStatusOrderByDaysRemainingAsc("ACTIVE");
        if (list.isEmpty()) {
            return assessAndStoreExpiryRisks();
        }
        return list;
    }

    public List<ExpiryRiskAlert> getCriticalAlerts() {
        return expiryAlertRepository.findByDaysRemainingLessThanEqualAndStatusOrderByDaysRemainingAsc(30, "ACTIVE");
    }
}
