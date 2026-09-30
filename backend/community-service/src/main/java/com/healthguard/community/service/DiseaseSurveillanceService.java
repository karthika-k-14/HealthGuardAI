package com.healthguard.community.service;

import com.healthguard.community.entity.DiseaseReport;

public interface DiseaseSurveillanceService {
    DiseaseReport saveReport(DiseaseReport report, String creatorName);
}
