package com.healthguard.citizen.service.impl;

import com.healthguard.citizen.dto.FamilyMemberRequest;
import com.healthguard.citizen.dto.FamilyMemberResponse;
import com.healthguard.citizen.entity.FamilyMember;
import com.healthguard.citizen.exception.ResourceNotFoundException;
import com.healthguard.citizen.repository.FamilyMemberRepository;
import com.healthguard.citizen.service.FamilyMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyMemberServiceImpl implements FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FamilyMemberResponse> getFamilyMembersByUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("User ID is required");
        }
        List<FamilyMember> members = familyMemberRepository.findByUserId(userId);
        if (members == null || members.isEmpty()) {
            return Collections.emptyList();
        }
        return members.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FamilyMemberResponse addFamilyMember(Long userId, FamilyMemberRequest request) {
        Long targetUserId = (userId != null && userId > 0) ? userId : (request != null ? request.getUserId() : null);
        if (targetUserId == null || targetUserId <= 0) {
            throw new IllegalArgumentException("User ID is required");
        }
        FamilyMember member = FamilyMember.builder()
                .userId(targetUserId)
                .name((request != null && request.getName() != null && !request.getName().isBlank()) ? request.getName() : "Family Member")
                .relation((request != null && request.getRelation() != null && !request.getRelation().isBlank()) ? request.getRelation() : "OTHER")
                .age(request != null ? request.getAge() : null)
                .gender(request != null ? request.getGender() : null)
                .bloodGroup(request != null ? request.getBloodGroup() : null)
                .phone(request != null ? request.getPhone() : null)
                .medicalConditions(request != null ? request.getMedicalConditions() : null)
                .build();
        FamilyMember saved = familyMemberRepository.save(member);
        return mapToResponse(saved);
    }


    @Override
    @Transactional
    public FamilyMemberResponse updateFamilyMember(Long id, FamilyMemberRequest request) {
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with ID: " + id));

        if (request != null) {
            if (request.getName() != null) member.setName(request.getName());
            if (request.getRelation() != null) member.setRelation(request.getRelation());
            if (request.getAge() != null) member.setAge(request.getAge());
            if (request.getGender() != null) member.setGender(request.getGender());
            if (request.getBloodGroup() != null) member.setBloodGroup(request.getBloodGroup());
            if (request.getPhone() != null) member.setPhone(request.getPhone());
            if (request.getMedicalConditions() != null) member.setMedicalConditions(request.getMedicalConditions());
        }

        FamilyMember updated = familyMemberRepository.save(member);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteFamilyMember(Long id) {
        FamilyMember member = familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found with ID: " + id));
        familyMemberRepository.delete(member);
    }

    private FamilyMemberResponse mapToResponse(FamilyMember member) {
        return FamilyMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUserId())
                .name(member.getName())
                .relation(member.getRelation())
                .age(member.getAge())
                .gender(member.getGender())
                .bloodGroup(member.getBloodGroup())
                .phone(member.getPhone())
                .medicalConditions(member.getMedicalConditions())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
