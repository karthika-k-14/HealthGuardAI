package com.healthguard.mapper;

import com.healthguard.dto.OfficerAshaWorkerResponse;
import com.healthguard.dto.OfficerPhcResponse;
import com.healthguard.dto.OfficerVillageDetailResponse;
import com.healthguard.dto.OfficerVillageResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Village;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Converts between the Health Officer module (Phase 3) entities and their
 * DTOs. Kept separate from {@link AshaMapper}/{@link CitizenMapper} since
 * the officer's view spans several villages at once rather than a single
 * assignment.
 */
@Component
public class OfficerMapper {

    public OfficerPhcResponse toPhcResponse(Phc phc, long ashaWorkerCount) {
        Village village = phc.getVillage();
        return OfficerPhcResponse.builder()
                .id(phc.getId())
                .uuid(phc.getUuid())
                .name(phc.getName())
                .address(phc.getAddress())
                .district(phc.getDistrict())
                .phone(phc.getPhone())
                .latitude(phc.getLatitude())
                .longitude(phc.getLongitude())
                .villageId(village != null ? village.getId() : null)
                .villageName(village != null ? village.getVillageName() : null)
                .ashaWorkerCount(ashaWorkerCount)
                .build();
    }

    public OfficerVillageResponse toVillageResponse(Village village, long citizenCount, long ashaWorkerCount,
                                                      long phcCount) {
        return OfficerVillageResponse.builder()
                .id(village.getId())
                .uuid(village.getUuid())
                .villageName(village.getVillageName())
                .district(village.getDistrict())
                .state(village.getState())
                .population(village.getPopulation())
                .latitude(village.getLatitude())
                .longitude(village.getLongitude())
                .citizenCount(citizenCount)
                .ashaWorkerCount(ashaWorkerCount)
                .phcCount(phcCount)
                .build();
    }

    public OfficerVillageDetailResponse toVillageDetailResponse(Village village, long citizenCount,
                                                                  long highRiskCitizenCount,
                                                                  List<OfficerAshaWorkerResponse> ashaWorkers,
                                                                  List<OfficerPhcResponse> phcs) {
        return OfficerVillageDetailResponse.builder()
                .id(village.getId())
                .uuid(village.getUuid())
                .villageName(village.getVillageName())
                .district(village.getDistrict())
                .state(village.getState())
                .population(village.getPopulation())
                .latitude(village.getLatitude())
                .longitude(village.getLongitude())
                .citizenCount(citizenCount)
                .highRiskCitizenCount(highRiskCitizenCount)
                .ashaWorkers(ashaWorkers)
                .phcs(phcs)
                .build();
    }

    public OfficerAshaWorkerResponse toAshaWorkerResponse(AshaWorker asha, long assignedCitizenCount) {
        Village village = asha.getAssignedVillage();
        Phc phc = asha.getAssignedPHC();
        return OfficerAshaWorkerResponse.builder()
                .id(asha.getId())
                .uuid(asha.getUuid())
                .firstName(asha.getFirstName())
                .lastName(asha.getLastName())
                .employeeId(asha.getEmployeeId())
                .phone(asha.getPhone())
                .email(asha.getEmail())
                .status(asha.getStatus())
                .yearsOfExperience(asha.getYearsOfExperience())
                .assignedVillageId(village != null ? village.getId() : null)
                .assignedVillageName(village != null ? village.getVillageName() : null)
                .assignedPhcId(phc != null ? phc.getId() : null)
                .assignedPhcName(phc != null ? phc.getName() : null)
                .assignedCitizenCount(assignedCitizenCount)
                .build();
    }
}
