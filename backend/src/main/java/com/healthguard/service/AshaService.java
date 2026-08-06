package com.healthguard.service;

import com.healthguard.dto.AshaDashboardResponse;
import com.healthguard.dto.AssignedCitizenDetailResponse;
import com.healthguard.dto.AssignedCitizenResponse;
import com.healthguard.dto.AssignedVillageResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.FamilyMember;
import com.healthguard.entity.HealthRecord;
import com.healthguard.entity.Village;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.AshaMapper;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.FamilyMemberRepository;
import com.healthguard.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Business logic for Phase 2A of the ASHA module: the ASHA worker's own
 * dashboard summary, and read-only access to the citizens and village
 * assigned to them.
 * <p>
 * An ASHA worker is assigned to exactly one village
 * ({@code AshaWorker.assignedVillage}); "assigned citizens" are simply the
 * citizens registered in that village ({@code Citizen.village}). Every
 * citizen-scoped lookup here is filtered by the caller's own assigned
 * village id, so one ASHA worker can never read a citizen outside their
 * assignment - not even by guessing an id.
 * <p>
 * Deliberately out of scope for this phase (and therefore not touched
 * here): pregnancy tracking, vaccination, home visits, surveys, follow-up,
 * and reports.
 */
@Service
@RequiredArgsConstructor
public class AshaService {

    private final CitizenRepository citizenRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final AshaMapper ashaMapper;

    // ---- Dashboard -----------------------------------------------------

    public AshaDashboardResponse getDashboard(AshaWorker asha) {
        long totalAssignedCitizens = countAssignedCitizens(asha);
        return ashaMapper.toDashboardResponse(asha, totalAssignedCitizens);
    }

    // ---- Assigned citizens ------------------------------------------------

    public List<AssignedCitizenResponse> getAssignedCitizens(AshaWorker asha) {
        Village village = asha.getAssignedVillage();
        if (village == null) {
            return Collections.emptyList();
        }
        return citizenRepository.findByVillageId(village.getId()).stream()
                .map(ashaMapper::toAssignedCitizenResponse)
                .toList();
    }

    public AssignedCitizenDetailResponse getAssignedCitizenDetails(AshaWorker asha, Long citizenId) {
        Citizen citizen = findAssignedCitizen(asha, citizenId);
        List<FamilyMember> familyMembers =
                familyMemberRepository.findByCitizenIdOrderByCreatedAtAsc(citizen.getId());
        List<HealthRecord> healthRecords =
                healthRecordRepository.findByCitizenIdOrderByRecordDateDesc(citizen.getId());
        return ashaMapper.toAssignedCitizenDetailResponse(citizen, familyMembers, healthRecords);
    }

    // ---- Assigned villages ------------------------------------------------

    public List<AssignedVillageResponse> getAssignedVillages(AshaWorker asha) {
        Village village = asha.getAssignedVillage();
        if (village == null) {
            return Collections.emptyList();
        }
        long citizenCount = citizenRepository.countByVillageId(village.getId());
        return List.of(ashaMapper.toAssignedVillageResponse(village, citizenCount));
    }

    // ---- Helpers -----------------------------------------------------

    private long countAssignedCitizens(AshaWorker asha) {
        Village village = asha.getAssignedVillage();
        if (village == null) {
            return 0L;
        }
        return citizenRepository.countByVillageId(village.getId());
    }

    /**
     * Looks up a citizen by id, but only if they belong to the calling
     * ASHA worker's assigned village. An ASHA worker with no assigned
     * village can never have an assigned citizen.
     */
    private Citizen findAssignedCitizen(AshaWorker asha, Long citizenId) {
        Village village = asha.getAssignedVillage();
        if (village == null) {
            throw new ResourceNotFoundException("Citizen not found: " + citizenId);
        }
        return citizenRepository.findByIdAndVillageId(citizenId, village.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found: " + citizenId));
    }
}
