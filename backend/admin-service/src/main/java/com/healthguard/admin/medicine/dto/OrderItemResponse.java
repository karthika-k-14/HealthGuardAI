package com.healthguard.admin.medicine.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {

    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private Integer currentStock;
    private Integer predictedDemand;
    private Integer recommendedOrder;
    private Integer receivedQuantity;
    private LocalDateTime createdAt;
}
