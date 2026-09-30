package com.healthguard.admin.medicine.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    private String orderNumber;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    private String supplierContact;

    private String supplierEmail;

    private String supplierAddress;

    private LocalDate expectedDeliveryDate;

    @Builder.Default
    private String status = "PLACED";

    private String remarks;

    @NotEmpty(message = "Order must contain at least one medicine item")
    @Valid
    private List<OrderItemRequest> items;
}
