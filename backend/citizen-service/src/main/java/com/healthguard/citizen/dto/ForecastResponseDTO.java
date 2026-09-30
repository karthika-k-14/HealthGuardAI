package com.healthguard.citizen.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastResponseDTO {

    private String medicine;
    private Integer predictedDemand;
    private String forecastMonth;
    private Double confidence;
}
