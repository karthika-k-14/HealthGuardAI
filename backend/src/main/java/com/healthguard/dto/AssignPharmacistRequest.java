package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Admin-only: assigns a Pharmacist to a PHC and pharmacy.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignPharmacistRequest {

    private String phcName;

    private String pharmacyName;
}
