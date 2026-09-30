package com.healthguard.admin.medicine.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String remarks;

    private LocalDate actualDeliveryDate;
}
