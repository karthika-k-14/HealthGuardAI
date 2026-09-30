package com.healthguard.community.service;

import com.healthguard.community.dto.ReferralDetailsDTO;
import com.healthguard.community.dto.ReferralStatisticsDTO;
import com.healthguard.community.entity.DiseaseReport;
import com.healthguard.community.entity.ReferralEntity;

import java.util.List;

public interface ReferralVerificationService {

    List<ReferralEntity> getAllReferrals(String status, String village, String disease, String severity, String search);

    ReferralDetailsDTO getReferralById(Long id);

    ReferralDetailsDTO approveReferral(Long id, String officerName, String remarks);

    ReferralDetailsDTO rejectReferral(Long id, String officerName, String remarks);

    ReferralDetailsDTO setUnderReview(Long id, String officerName, String remarks);

    ReferralStatisticsDTO getStatistics();

    ReferralEntity createReferralFromSurveillanceReport(DiseaseReport report, String officerName, String phcName);
}
