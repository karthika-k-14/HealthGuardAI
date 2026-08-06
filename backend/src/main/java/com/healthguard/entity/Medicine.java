package com.healthguard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A single medicine line item in the pharmacist's inventory (Phase 4 -
 * Pharmacist Module). Stock level, expiry, and batch/manufacturer details
 * live directly on this entity rather than a separate "batch" table, since
 * the current pharmacy workflow tracks one active batch per medicine at a
 * time.
 * <p>
 * "Stock status" (In Stock / Low Stock / Out of Stock / Expired) is
 * deliberately not persisted - it's derived from {@code quantity},
 * {@code minStockThreshold}, and {@code expiryDate} at read time (see
 * {@code PharmacistMapper}) so it never drifts out of sync with the
 * underlying numbers.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medicines")
public class Medicine extends BaseEntity {

    @NotBlank
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @NotNull
    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Quantity at or below which the medicine is considered "Low Stock".
     * Defaults to 20 to match the threshold the pharmacist UI has always
     * used.
     */
    @NotNull
    @Column(name = "min_stock_threshold", nullable = false)
    @Builder.Default
    private Integer minStockThreshold = 20;
}
