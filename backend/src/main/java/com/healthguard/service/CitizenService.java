package com.healthguard.service;

import com.healthguard.dto.CitizenProfileResponse;
import com.healthguard.dto.CitizenProfileUpdateRequest;
import com.healthguard.dto.FamilyMemberRequest;
import com.healthguard.dto.FamilyMemberResponse;
import com.healthguard.dto.HealthRecordRequest;
import com.healthguard.dto.HealthRecordResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.FamilyMember;
import com.healthguard.entity.HealthRecord;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.CitizenMapper;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.FamilyMemberRepository;
import com.healthguard.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for the Citizen Module (Phase 1): a citizen's own
 * profile, family members, and health records.
 * <p>
 * Every method is scoped to the calling citizen - family members and
 * health records are always looked up via {@code findByIdAndCitizenId},
 * so one citizen can never read or modify another citizen's records
 * even if they guess an id.
 */
@Service
@RequiredArgsConstructor
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final CitizenMapper citizenMapper;

    // ---- Profile -----------------------------------------------------

    public CitizenProfileResponse getProfile(Citizen citizen) {
        return citizenMapper.toProfileResponse(citizen);
    }

    @Transactional
    public CitizenProfileResponse updateProfile(Citizen citizen, CitizenProfileUpdateRequest request) {
        citizenMapper.applyUpdate(citizen, request);
        citizen.setBmi(computeBmi(citizen.getHeight(), citizen.getWeight()));
        Citizen saved = citizenRepository.save(citizen);
        return citizenMapper.toProfileResponse(saved);
    }

    /** BMI = weight(kg) / height(m)^2. Returns null if either input is missing. */
    private Double computeBmi(Double heightCm, Double weightKg) {
        if (heightCm == null || weightKg == null || heightCm <= 0) {
            return null;
        }
        double heightM = heightCm / 100.0;
        return Math.round((weightKg / (heightM * heightM)) * 100.0) / 100.0;
    }

    // ---- Family members ------------------------------------------------

    public List<FamilyMemberResponse> listFamilyMembers(Citizen citizen) {
        return familyMemberRepository.findByCitizenIdOrderByCreatedAtAsc(citizen.getId()).stream()
                .map(citizenMapper::toFamilyMemberResponse)
                .toList();
    }

    @Transactional
    public FamilyMemberResponse addFamilyMember(Citizen citizen, FamilyMemberRequest request) {
        FamilyMember member = citizenMapper.toFamilyMember(request, citizen);
        FamilyMember saved = familyMemberRepository.save(member);
        return citizenMapper.toFamilyMemberResponse(saved);
    }

    @Transactional
    public FamilyMemberResponse updateFamilyMember(Citizen citizen, Long memberId, FamilyMemberRequest request) {
        FamilyMember member = findOwnedFamilyMember(citizen, memberId);
        citizenMapper.applyFamilyMemberUpdate(member, request);
        FamilyMember saved = familyMemberRepository.save(member);
        return citizenMapper.toFamilyMemberResponse(saved);
    }

    @Transactional
    public void deleteFamilyMember(Citizen citizen, Long memberId) {
        FamilyMember member = findOwnedFamilyMember(citizen, memberId);
        familyMemberRepository.delete(member);
    }

    private FamilyMember findOwnedFamilyMember(Citizen citizen, Long memberId) {
        return familyMemberRepository.findByIdAndCitizenId(memberId, citizen.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found: " + memberId));
    }

    // ---- Health records ------------------------------------------------

    public List<HealthRecordResponse> listHealthRecords(Citizen citizen) {
        return healthRecordRepository.findByCitizenIdOrderByRecordDateDesc(citizen.getId()).stream()
                .map(citizenMapper::toHealthRecordResponse)
                .toList();
    }

    @Transactional
    public HealthRecordResponse addHealthRecord(Citizen citizen, HealthRecordRequest request) {
        HealthRecord record = citizenMapper.toHealthRecord(request, citizen);
        HealthRecord saved = healthRecordRepository.save(record);
        return citizenMapper.toHealthRecordResponse(saved);
    }

    @Transactional
    public HealthRecordResponse updateHealthRecord(Citizen citizen, Long recordId, HealthRecordRequest request) {
        HealthRecord record = findOwnedHealthRecord(citizen, recordId);
        citizenMapper.applyHealthRecordUpdate(record, request);
        HealthRecord saved = healthRecordRepository.save(record);
        return citizenMapper.toHealthRecordResponse(saved);
    }

    @Transactional
    public void deleteHealthRecord(Citizen citizen, Long recordId) {
        HealthRecord record = findOwnedHealthRecord(citizen, recordId);
        healthRecordRepository.delete(record);
    }

    private HealthRecord findOwnedHealthRecord(Citizen citizen, Long recordId) {
        return healthRecordRepository.findByIdAndCitizenId(recordId, citizen.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Health record not found: " + recordId));
    }
}
