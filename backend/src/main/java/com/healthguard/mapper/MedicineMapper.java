package com.healthguard.mapper;

import com.healthguard.dto.MedicineResponse;
import com.healthguard.entity.Medicine;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Converts {@link Medicine} entities to {@link MedicineResponse} DTOs for
 * the standalone Medicine catalog module ({@code /medicines/**} and
 * {@code /admin/medicines/**}).
 * <p>
 * {@code stockStatus} is derived at read time from quantity, threshold, and
 * expiry rather than persisted, so it can never drift out of sync with the
 * underlying numbers - the same rule the Pharmacist module's inventory view
 * uses.
 */
@Component
public class MedicineMapper {

    public MedicineResponse toResponse(Medicine medicine) {
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
     * reported as merely "In Stock"/"Low Stock" even if units remain, since
     * those units should not be dispensed.
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
}
