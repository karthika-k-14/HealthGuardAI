package com.healthguard.dto;

import com.healthguard.entity.AshaWorkerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Summary returned by {@code GET /asha/dashboard} - the authenticated
 * ASHA worker's own identity plus the counts their dashboard home screen
 * needs (assigned village, assigned citizen count). Deliberately excludes
 * anything to do with home visits, vaccinations, or surveys since those
 * modules are out of scope for Phase 2A.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AshaDashboardResponse {

    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String employeeId;
    private AshaWorkerStatus status;

    private Long assignedVillageId;
    private String assignedVillageName;
    private String assignedVillageDistrict;

    private String assignedPhcName;

    private long totalAssignedCitizens;
}
