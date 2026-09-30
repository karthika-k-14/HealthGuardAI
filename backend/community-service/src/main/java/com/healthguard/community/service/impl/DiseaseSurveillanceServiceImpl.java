package com.healthguard.community.service.impl;

import com.healthguard.community.entity.DiseaseReport;
import com.healthguard.community.repository.DiseaseReportRepository;
import com.healthguard.community.service.DiseaseSurveillanceService;
import com.healthguard.community.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiseaseSurveillanceServiceImpl implements DiseaseSurveillanceService {

    private final DiseaseReportRepository diseaseReportRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public DiseaseReport saveReport(DiseaseReport report, String creatorName) {
        DiseaseReport saved = diseaseReportRepository.save(report);
        log.info("Disease report saved in database with ID {}", saved.getReportId());

        // Step 3 & 4: NotificationService integration & NotificationRepository.save()
        notificationService.createHealthOfficerNotificationForReport(saved, creatorName);

        return saved;
    }
}
