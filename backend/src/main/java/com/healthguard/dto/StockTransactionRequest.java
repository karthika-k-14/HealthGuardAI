package com.healthguard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for {@code POST /pharmacist/stock/in} and
 * {@code POST /pharmacist/stock/out} - a manual stock adjustment against
 * one {@link com.healthguard.entity.Medicine}.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionRequest {

    @NotNull(message = "Medicine id is required")
    private Long medicineId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String reason;
}
