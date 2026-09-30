package com.healthguard.admin.medicine.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastRecommendationDTO {

    private Long medicineId;
    private String medicineName;
    private Integer currentStock;
    private Integer predictedDemand;
    private Integer recommendedOrder;
    private Integer estimatedDaysOfStockRemaining;
    private Double confidence;
    private String riskLevel;
    private String insights;
    private String reason;
}
