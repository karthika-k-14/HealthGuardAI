package com.healthguard.mapper;

import com.healthguard.dto.AshaDashboardResponse;
import com.healthguard.dto.AssignedCitizenDetailResponse;
import com.healthguard.dto.AssignedCitizenResponse;
import com.healthguard.dto.AssignedVillageResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.FamilyMember;
import com.healthguard.entity.HealthRecord;
import com.healthguard.entity.Village;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Converts between the ASHA-module (Phase 2A) entities and their DTOs:
 * {@link AshaWorker}'s own dashboard summary, and the {@link Citizen}s and
 * {@link Village} assigned to them. Kept separate from {@link CitizenMapper}
 * (which maps a citizen's *own* view of their profile) since the ASHA views
 * are read-only and intentionally expose a different field set.
 */
@Component
public class AshaMapper {

    public AshaDashboardResponse toDashboardResponse(AshaWorker asha, long totalAssignedCitizens) {
        Village village = asha.getAssignedVillage();
        return AshaDashboardResponse.builder()
                .id(asha.getId())
                .uuid(asha.getUuid())
                .firstName(asha.getFirstName())
                .lastName(asha.getLastName())
                .employeeId(asha.getEmployeeId())
                .status(asha.getStatus())
                .assignedVillageId(village != null ? village.getId() : null)
                .assignedVillageName(village != null ? village.getVillageName() : null)
                .assignedVillageDistrict(village != null ? village.getDistrict() : null)
                .assignedPhcName(asha.getAssignedPHC() != null ? asha.getAssignedPHC().getName() : null)
                .totalAssignedCitizens(totalAssignedCitizens)
                .build();
    }

    public AssignedCitizenResponse toAssignedCitizenResponse(Citizen citizen) {
        return AssignedCitizenResponse.builder()
                .id(citizen.getId())
                .uuid(citizen.getUuid())
                .firstName(citizen.getFirstName())
                .lastName(citizen.getLastName())
                .phone(citizen.getPhone())
                .gender(citizen.getGender())
                .age(citizen.getAge())
                .bloodGroup(citizen.getBloodGroup())
                .address(citizen.getAddress())
                .villageName(citizen.getVillage() != null ? citizen.getVillage().getVillageName() : null)
                .accountStatus(citizen.getAccountStatus())
                .build();
    }

    public AssignedCitizenDetailResponse toAssignedCitizenDetailResponse(
            Citizen citizen,
            List<FamilyMember> familyMembers,
            List<HealthRecord> healthRecords) {
        return AssignedCitizenDetailResponse.builder()
                .id(citizen.getId())
                .uuid(citizen.getUuid())
                .firstName(citizen.getFirstName())
                .lastName(citizen.getLastName())
                .email(citizen.getEmail())
                .phone(citizen.getPhone())
                .gender(citizen.getGender())
                .dateOfBirth(citizen.getDateOfBirth())
                .age(citizen.getAge())
                .bloodGroup(citizen.getBloodGroup())
                .preferredLanguage(citizen.getPreferredLanguage())
                .address(citizen.getAddress())
                .district(citizen.getDistrict())
                .state(citizen.getState())
                .pincode(citizen.getPincode())
                .height(citizen.getHeight())
                .weight(citizen.getWeight())
                .bmi(citizen.getBmi())
                .emergencyContactName(citizen.getEmergencyContactName())
                .emergencyContactPhone(citizen.getEmergencyContactPhone())
                .chronicDiseases(citizen.getChronicDiseases())
                .allergies(citizen.getAllergies())
                .medicalHistory(citizen.getMedicalHistory())
                .villageName(citizen.getVillage() != null ? citizen.getVillage().getVillageName() : null)
                .accountStatus(citizen.getAccountStatus())
                .familyMembers(familyMembers.stream().map(this::toFamilyMemberResponse).toList())
                .healthRecords(healthRecords.stream().map(this::toHealthRecordResponse).toList())
                .build();
    }

    public AssignedVillageResponse toAssignedVillageResponse(Village village, long assignedCitizenCount) {
        return AssignedVillageResponse.builder()
                .id(village.getId())
                .uuid(village.getUuid())
                .villageName(village.getVillageName())
                .district(village.getDistrict())
                .state(village.getState())
                .population(village.getPopulation())
                .assignedCitizenCount(assignedCitizenCount)
                .build();
    }

    // ---- Reused shapes (same fields the citizen sees on their own
    // profile) - kept local rather than calling into CitizenMapper so the
    // two mappers stay independently testable and don't cross-depend. ----

    private com.healthguard.dto.FamilyMemberResponse toFamilyMemberResponse(FamilyMember member) {
        return com.healthguard.dto.FamilyMemberResponse.builder()
                .id(member.getId())
                .uuid(member.getUuid())
                .name(member.getName())
                .relation(member.getRelation())
                .age(member.getAge())
                .gender(member.getGender())
                .bloodGroup(member.getBloodGroup())
                .phone(member.getPhone())
                .medicalConditions(member.getMedicalConditions())
                .createdAt(member.getCreatedAt())
                .build();
    }

    private com.healthguard.dto.HealthRecordResponse toHealthRecordResponse(HealthRecord record) {
        return com.healthguard.dto.HealthRecordResponse.builder()
                .id(record.getId())
                .uuid(record.getUuid())
                .recordType(record.getRecordType())
                .title(record.getTitle())
                .description(record.getDescription())
                .doctorName(record.getDoctorName())
                .hospitalName(record.getHospitalName())
                .recordDate(record.getRecordDate())
                .attachmentUrl(record.getAttachmentUrl())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
