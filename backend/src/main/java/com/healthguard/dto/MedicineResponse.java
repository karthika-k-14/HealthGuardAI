package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Returned for a {@link com.healthguard.entity.Medicine} inventory item.
 * {@code stockStatus} is one of {@code In Stock}, {@code Low Stock},
 * {@code Out of Stock}, or {@code Expired} - derived at read time from
 * quantity/threshold/expiry rather than stored, so it can never drift out
 * of sync (see {@code PharmacistMapper}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String category;
    private String manufacturer;
    private String batchNumber;
    private Integer quantity;
    private String unit;
    private BigDecimal price;
    private LocalDate expiryDate;
    private String description;
    private Integer minStockThreshold;
    private String stockStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
