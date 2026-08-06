package com.healthguard.service;

import com.healthguard.dto.ReferralRequest;
import com.healthguard.dto.ReferralResponse;
import com.healthguard.entity.Referral;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.ReferralMapper;
import com.healthguard.repository.ReferralRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for the Referral CRUD module ({@code /admin/referrals/**}).
 * A referral tracks a citizen being referred from one facility/worker to
 * another (e.g. ASHA -> PHC, PHC -> Hospital).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReferralService {

    private static final String DEFAULT_STATUS = "Pending";

    private final ReferralRepository referralRepository;
    private final ReferralMapper referralMapper;

    public List<ReferralResponse> getAllReferrals() {
        return referralRepository.findAll().stream()
                .map(referralMapper::toResponse)
                .toList();
    }

    public ReferralResponse getReferralById(Long referralId) {
        return referralMapper.toResponse(findReferralOrThrow(referralId));
    }

    @Transactional
    public ReferralResponse createReferral(ReferralRequest request) {
        Referral referral = Referral.builder()
                .citizenName(request.getCitizenName())
                .referredBy(request.getReferredBy())
                .fromFacility(request.getFromFacility())
                .toFacility(request.getToFacility())
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(request.getStatus() != null && !request.getStatus().isBlank()
                        ? request.getStatus() : DEFAULT_STATUS)
                .build();

        return referralMapper.toResponse(referralRepository.save(referral));
    }

    @Transactional
    public ReferralResponse updateReferral(Long referralId, ReferralRequest request) {
        Referral referral = findReferralOrThrow(referralId);

        referral.setCitizenName(request.getCitizenName());
        referral.setReferredBy(request.getReferredBy());
        referral.setFromFacility(request.getFromFacility());
        referral.setToFacility(request.getToFacility());
        referral.setReason(request.getReason());
        referral.setNotes(request.getNotes());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            referral.setStatus(request.getStatus());
        }

        return referralMapper.toResponse(referralRepository.save(referral));
    }

    @Transactional
    public void deleteReferral(Long referralId) {
        Referral referral = findReferralOrThrow(referralId);
        referralRepository.delete(referral);
    }

    private Referral findReferralOrThrow(Long referralId) {
        return referralRepository.findById(referralId)
                .orElseThrow(() -> new ResourceNotFoundException("Referral not found with id: " + referralId));
    }
}
