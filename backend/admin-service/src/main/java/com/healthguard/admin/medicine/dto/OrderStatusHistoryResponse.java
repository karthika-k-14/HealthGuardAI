package com.healthguard.admin.medicine.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusHistoryResponse {

    private Long id;
    private String previousStatus;
    private String newStatus;
    private String changedBy;
    private String remarks;
    private LocalDateTime changedAt;
}
