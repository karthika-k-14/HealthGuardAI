package com.healthguard.admin.medicine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {

    private Long id;
    private String medicineCode;
    private String medicineName;
    private String name;
    private String category;
    private String manufacturer;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer quantity;
    private String unit;
    private BigDecimal price;
    private String description;
    private Integer minStockThreshold;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
