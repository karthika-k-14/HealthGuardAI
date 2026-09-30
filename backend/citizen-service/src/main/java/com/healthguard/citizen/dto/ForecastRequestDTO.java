package com.healthguard.citizen.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastRequestDTO {

    @NotBlank(message = "Medicine name cannot be blank")
    private String medicine;

    @NotNull(message = "Historical usage is required")
    @Min(value = 0, message = "Historical usage cannot be negative")
    private Integer historicalUsage;

    @Builder.Default
    private Integer monthOffset = 1;

    @Builder.Default
    private Integer districtOutbreakRisk = 0;
}
