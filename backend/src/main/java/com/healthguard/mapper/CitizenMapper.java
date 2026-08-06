package com.healthguard.mapper;

import com.healthguard.dto.CitizenProfileResponse;
import com.healthguard.dto.CitizenProfileUpdateRequest;
import com.healthguard.dto.FamilyMemberRequest;
import com.healthguard.dto.FamilyMemberResponse;
import com.healthguard.dto.HealthRecordRequest;
import com.healthguard.dto.HealthRecordResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.FamilyMember;
import com.healthguard.entity.HealthRecord;
import org.springframework.stereotype.Component;

/**
 * Converts between the Citizen-module entities ({@link Citizen},
 * {@link FamilyMember}, {@link HealthRecord}) and their DTOs. Kept separate
 * from {@link AuthMapper}, which only ever deals with registration/login
 * concerns.
 */
@Component
public class CitizenMapper {

    public CitizenProfileResponse toProfileResponse(Citizen citizen) {
        return CitizenProfileResponse.builder()
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
                .aadhaarNumber(citizen.getAadhaarNumber())
                .preferredLanguage(citizen.getPreferredLanguage())
                .address(citizen.getAddress())
                .district(citizen.getDistrict())
                .state(citizen.getState())
                .pincode(citizen.getPincode())
                .latitude(citizen.getLatitude())
                .longitude(citizen.getLongitude())
                .profilePhoto(citizen.getProfilePhoto())
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
                .profileCompleted(citizen.getProfileCompleted())
                .build();
    }

    /**
     * Applies an update request onto an already-loaded Citizen. Age and BMI
     * are recomputed here rather than trusted from the client.
     */
    public void applyUpdate(Citizen citizen, CitizenProfileUpdateRequest request) {
        citizen.setGender(request.getGender());
        citizen.setDateOfBirth(request.getDateOfBirth());
        citizen.setBloodGroup(request.getBloodGroup());
        citizen.setAddress(request.getAddress());
        citizen.setDistrict(request.getDistrict());
        citizen.setState(request.getState());
        citizen.setPincode(request.getPincode());
        citizen.setPreferredLanguage(request.getPreferredLanguage());
        citizen.setLatitude(request.getLatitude());
        citizen.setLongitude(request.getLongitude());
        citizen.setProfilePhoto(request.getProfilePhoto());
        citizen.setHeight(request.getHeight());
        citizen.setWeight(request.getWeight());
        citizen.setEmergencyContactName(request.getEmergencyContactName());
        citizen.setEmergencyContactPhone(request.getEmergencyContactPhone());
        citizen.setChronicDiseases(request.getChronicDiseases());
        citizen.setAllergies(request.getAllergies());
        citizen.setMedicalHistory(request.getMedicalHistory());
    }

    public FamilyMemberResponse toFamilyMemberResponse(FamilyMember member) {
        return FamilyMemberResponse.builder()
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

    public FamilyMember toFamilyMember(FamilyMemberRequest request, Citizen citizen) {
        return FamilyMember.builder()
                .citizen(citizen)
                .name(request.getName())
                .relation(request.getRelation())
                .age(request.getAge())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .phone(request.getPhone())
                .medicalConditions(request.getMedicalConditions())
                .build();
    }

    public void applyFamilyMemberUpdate(FamilyMember member, FamilyMemberRequest request) {
        member.setName(request.getName());
        member.setRelation(request.getRelation());
        member.setAge(request.getAge());
        member.setGender(request.getGender());
        member.setBloodGroup(request.getBloodGroup());
        member.setPhone(request.getPhone());
        member.setMedicalConditions(request.getMedicalConditions());
    }

    public HealthRecordResponse toHealthRecordResponse(HealthRecord record) {
        return HealthRecordResponse.builder()
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

    public HealthRecord toHealthRecord(HealthRecordRequest request, Citizen citizen) {
        return HealthRecord.builder()
                .citizen(citizen)
                .recordType(request.getRecordType())
                .title(request.getTitle())
                .description(request.getDescription())
                .doctorName(request.getDoctorName())
                .hospitalName(request.getHospitalName())
                .recordDate(request.getRecordDate())
                .attachmentUrl(request.getAttachmentUrl())
                .build();
    }

    public void applyHealthRecordUpdate(HealthRecord record, HealthRecordRequest request) {
        record.setRecordType(request.getRecordType());
        record.setTitle(request.getTitle());
        record.setDescription(request.getDescription());
        record.setDoctorName(request.getDoctorName());
        record.setHospitalName(request.getHospitalName());
        record.setRecordDate(request.getRecordDate());
        record.setAttachmentUrl(request.getAttachmentUrl());
    }
}
