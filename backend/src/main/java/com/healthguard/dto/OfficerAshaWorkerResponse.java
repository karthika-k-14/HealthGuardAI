package com.healthguard.dto;

import com.healthguard.entity.AshaWorkerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * An ASHA worker returned by {@code GET /officer/asha-workers} - scoped to
 * workers assigned to a village under the authenticated Health Officer's
 * supervision.
 * <p>
 * {@code assignedCitizenCount} (citizens in the worker's village) stands in
 * for a performance summary, since there is no home-visit/task-tracking
 * entity yet to report actual pending/completed visit counts from.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerAshaWorkerResponse {

    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String employeeId;
    private String phone;
    private String email;
    private AshaWorkerStatus status;
    private Integer yearsOfExperience;

    private Long assignedVillageId;
    private String assignedVillageName;
    private Long assignedPhcId;
    private String assignedPhcName;

    private long assignedCitizenCount;
}
