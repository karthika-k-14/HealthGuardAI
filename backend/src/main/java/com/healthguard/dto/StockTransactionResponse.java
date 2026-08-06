package com.healthguard.dto;

import com.healthguard.entity.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Returned for a {@link com.healthguard.entity.StockTransaction} - one
 * stock-in or stock-out movement recorded against a medicine.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionResponse {

    private Long id;
    private UUID uuid;
    private Long medicineId;
    private String medicineName;
    private StockMovementType movementType;
    private Integer quantity;
    private String reason;
    private String performedByName;
    private LocalDateTime transactionDate;
}
