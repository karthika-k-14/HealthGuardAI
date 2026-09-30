package com.healthguard.citizen.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UrgencyRequestDTO {

    @NotBlank(message = "Symptoms cannot be empty or blank")
    private String symptoms;
}
