package com.healthguard.community.dto;

import com.healthguard.community.entity.ReferralEntity;
import com.healthguard.community.entity.ReferralStatusHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferralDetailsDTO {

    private Long id;
    private String referralCode;
    private String patientName;
    private Integer patientAge;
    private String patientGender;
    private String citizenId;
    private String phoneNumber;
    private String village;
    private String address;
    private String disease;
    private String severity;
    private String symptoms;
    private String vitalSigns;
    private String referralReason;
    private String referredPhc;
    private Long reportId;
    private Long visitId;
    private String attachedNotes;
    private String createdBy;
    private String status;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private String verificationRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Audit trail
    private List<ReferralStatusHistory> statusHistory;

    // Linked clinical context
    private Object linkedReport;
    private Object linkedVisit;

    public static ReferralDetailsDTO fromEntity(ReferralEntity entity, List<ReferralStatusHistory> history, Object report, Object visit) {
        if (entity == null) return null;
        return ReferralDetailsDTO.builder()
                .id(entity.getId())
                .referralCode(entity.getReferralCode())
                .patientName(entity.getPatientName())
                .patientAge(entity.getPatientAge())
                .patientGender(entity.getPatientGender())
                .citizenId(entity.getCitizenId())
                .phoneNumber(entity.getPhoneNumber())
                .village(entity.getVillage())
                .address(entity.getAddress())
                .disease(entity.getDisease())
                .severity(entity.getSeverity())
                .symptoms(entity.getSymptoms())
                .vitalSigns(entity.getVitalSigns())
                .referralReason(entity.getReferralReason())
                .referredPhc(entity.getReferredPhc())
                .reportId(entity.getReportId())
                .visitId(entity.getVisitId())
                .attachedNotes(entity.getAttachedNotes())
                .createdBy(entity.getCreatedBy())
                .status(entity.getStatus())
                .verifiedBy(entity.getVerifiedBy())
                .verifiedAt(entity.getVerifiedAt())
                .verificationRemarks(entity.getVerificationRemarks())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .statusHistory(history)
                .linkedReport(report)
                .linkedVisit(visit)
                .build();
    }
}
