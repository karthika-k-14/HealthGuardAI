package com.healthguard.admin.medicine.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDashboardStatsDTO {

    private long totalOrders;
    private long pendingOrders;
    private long inTransitOrders;
    private long deliveredOrders;
    private long cancelledOrders;
    private long draftOrders;
}
