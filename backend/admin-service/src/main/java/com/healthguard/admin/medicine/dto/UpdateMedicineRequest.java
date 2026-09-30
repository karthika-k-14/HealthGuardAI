package com.healthguard.admin.medicine.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMedicineRequest {

    private String medicineName;

    private String name;

    private String category;

    private String manufacturer;

    private String batchNumber;

    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private String unit;

    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    private BigDecimal price;

    private String description;

    private Integer minStockThreshold;
}
