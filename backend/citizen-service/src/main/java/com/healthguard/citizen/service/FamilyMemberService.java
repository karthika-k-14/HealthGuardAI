package com.healthguard.citizen.service;

import com.healthguard.citizen.dto.FamilyMemberRequest;
import com.healthguard.citizen.dto.FamilyMemberResponse;

import java.util.List;

public interface FamilyMemberService {

    List<FamilyMemberResponse> getFamilyMembersByUserId(Long userId);

    FamilyMemberResponse addFamilyMember(Long userId, FamilyMemberRequest request);

    FamilyMemberResponse updateFamilyMember(Long id, FamilyMemberRequest request);

    void deleteFamilyMember(Long id);
}
