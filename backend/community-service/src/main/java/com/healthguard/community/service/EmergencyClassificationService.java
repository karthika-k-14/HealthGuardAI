package com.healthguard.community.service;

import com.healthguard.community.dto.EmergencyClassificationResult;

public interface EmergencyClassificationService {

    EmergencyClassificationResult analyzeSymptoms(String symptoms, String diseaseCategory, Double riskScore);

    String calculateUrgency(String symptoms, String diseaseCategory, Double riskScore);

    boolean detectLifeThreateningSymptoms(String symptoms);

    String classifyRisk(String urgencyLevel);
}
