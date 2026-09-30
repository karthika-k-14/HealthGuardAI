package com.healthguard.admin.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private long totalAdmins;
    private long totalHealthOfficers;
    private long totalPharmacists;
    private long totalMedicines;
    private long totalPrescriptions;
    private String systemStatus;
}
