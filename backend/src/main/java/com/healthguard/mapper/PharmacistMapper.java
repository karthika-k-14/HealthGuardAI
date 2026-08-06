package com.healthguard.mapper;

import com.healthguard.dto.MedicineResponse;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.dto.StockTransactionResponse;
import com.healthguard.entity.Medicine;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.StockTransaction;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Converts between the Pharmacist-module (Phase 4) entities - Medicine,
 * StockTransaction, Prescription - and their DTOs.
 */
@Component
public class PharmacistMapper {

    public MedicineResponse toMedicineResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .uuid(medicine.getUuid())
                .name(medicine.getName())
                .category(medicine.getCategory())
                .manufacturer(medicine.getManufacturer())
                .batchNumber(medicine.getBatchNumber())
                .quantity(medicine.getQuantity())
                .unit(medicine.getUnit())
                .price(medicine.getPrice())
                .expiryDate(medicine.getExpiryDate())
                .description(medicine.getDescription())
                .minStockThreshold(medicine.getMinStockThreshold())
                .stockStatus(computeStockStatus(medicine))
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }

    /**
     * Expiry takes precedence over quantity: an expired medicine is never
     * reported as merely "In Stock"/"Low Stock" even if units remain,
     * since those units should not be dispensed.
     */
    public String computeStockStatus(Medicine medicine) {
        if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(LocalDate.now())) {
            return "Expired";
        }
        int quantity = medicine.getQuantity() != null ? medicine.getQuantity() : 0;
        int threshold = medicine.getMinStockThreshold() != null ? medicine.getMinStockThreshold() : 0;
        if (quantity <= 0) {
            return "Out of Stock";
        }
        if (quantity <= threshold) {
            return "Low Stock";
        }
        return "In Stock";
    }

    public StockTransactionResponse toStockTransactionResponse(StockTransaction transaction) {
        Pharmacist pharmacist = transaction.getPerformedBy();
        return StockTransactionResponse.builder()
                .id(transaction.getId())
                .uuid(transaction.getUuid())
                .medicineId(transaction.getMedicine().getId())
                .medicineName(transaction.getMedicine().getName())
                .movementType(transaction.getMovementType())
                .quantity(transaction.getQuantity())
                .reason(transaction.getReason())
                .performedByName(pharmacist != null
                        ? (pharmacist.getFirstName() + " " + pharmacist.getLastName()).trim()
                        : null)
                .transactionDate(transaction.getTransactionDate())
                .build();
    }

    public PrescriptionResponse toPrescriptionResponse(Prescription prescription) {
        Pharmacist pharmacist = prescription.getHandledBy();
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .uuid(prescription.getUuid())
                .patientName(prescription.getPatientName())
                .patientAge(prescription.getPatientAge())
                .referredBy(prescription.getReferredBy())
                .medicines(splitMedicines(prescription.getMedicines()))
                .status(prescription.getStatus())
                .notes(prescription.getNotes())
                .handledByName(pharmacist != null
                        ? (pharmacist.getFirstName() + " " + pharmacist.getLastName()).trim()
                        : null)
                .verifiedAt(prescription.getVerifiedAt())
                .dispensedAt(prescription.getDispensedAt())
                .createdAt(prescription.getCreatedAt())
                .build();
    }

    public String joinMedicines(List<String> medicines) {
        return String.join(",", medicines);
    }

    private List<String> splitMedicines(String medicines) {
        if (medicines == null || medicines.isBlank()) {
            return List.of();
        }
        return Arrays.stream(medicines.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
