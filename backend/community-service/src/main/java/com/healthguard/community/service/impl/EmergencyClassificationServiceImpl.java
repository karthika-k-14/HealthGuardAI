package com.healthguard.community.service.impl;

import com.healthguard.community.dto.EmergencyClassificationResult;
import com.healthguard.community.service.EmergencyClassificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class EmergencyClassificationServiceImpl implements EmergencyClassificationService {

    private static final List<String> CRITICAL_KEYWORDS = Arrays.asList(
            "chest pain", "heart attack", "cardiac", "cardiac arrest", "cardiac distress",
            "breathing difficulty", "difficulty breathing", "shortness of breath", "severe breathlessness",
            "unable to breathe", "suffocation", "choking", "gasping", "cyanosis", "blue lips",
            "stroke", "facial droop", "slurred speech", "arm weakness", "paralysis", "sudden numbness",
            "unconscious", "unconsciousness", "passed out", "fainting", "syncope", "unresponsive", "coma",
            "seizure", "convulsion", "fits", "epilepsy attack",
            "severe bleeding", "profuse bleeding", "hemorrhage", "vomiting blood", "coughing blood", "blood in vomit",
            "anaphylaxis", "severe allergic reaction", "throat swelling"
    );

    private static final List<String> HIGH_KEYWORDS = Arrays.asList(
            "high fever", "burning fever", "103", "104", "102", "39 c", "40 c", "fever for days",
            "severe dehydration", "extreme thirst", "sunken eyes", "no urination",
            "continuous vomiting", "frequent vomiting", "persistent vomiting", "cannot keep fluids down",
            "pregnancy bleeding", "labor pain", "amniotic fluid", "preeclampsia", "high risk pregnancy",
            "severe abdominal pain", "acute abdomen", "appendix", "appendicitis", "severe stomach cramps",
            "low platelets", "dengue hemorrhagic", "dengue with bleeding", "severe malaria",
            "sudden vision loss", "severe head injury", "head trauma", "poisoning"
    );

    private static final List<String> MEDIUM_KEYWORDS = Arrays.asList(
            "fever", "cough", "persistent cough", "infection", "stomach upset", "diarrhea",
            "vomiting", "nausea", "body ache", "joint pain", "headache", "fatigue",
            "moderate pain", "skin rash", "chills", "sore throat", "flu"
    );

    @Override
    public EmergencyClassificationResult analyzeSymptoms(String symptoms, String diseaseCategory, Double riskScore) {
        String urgency = calculateUrgency(symptoms, diseaseCategory, riskScore);
        boolean isLifeThreatening = detectLifeThreateningSymptoms(symptoms);
        double score = calculateUrgencyScore(urgency, riskScore);

        String recommendedAction;
        String rationale;

        switch (urgency) {
            case "CRITICAL":
                recommendedAction = "Immediately escalate to assigned ASHA Worker and Health Officer. Hospital emergency dispatch advised.";
                rationale = "Life-threatening symptoms detected requiring emergency medical stabilization.";
                break;
            case "HIGH":
                recommendedAction = "Automatically escalate to assigned ASHA Worker for priority home assessment and clinic referral.";
                rationale = "High-severity symptoms requiring timely medical evaluation within hours.";
                break;
            case "MEDIUM":
                recommendedAction = "Provide clinical advice and suggest consultation at the nearest Primary Health Centre (PHC).";
                rationale = "Moderate health concern appropriate for outpatient primary care evaluation.";
                break;
            case "LOW":
            default:
                recommendedAction = "Provide self-care guidelines and hydration advice. Monitor symptoms.";
                rationale = "Mild symptoms manageable through primary self-care.";
                break;
        }

        return EmergencyClassificationResult.builder()
                .urgencyLevel(urgency)
                .urgencyScore(score)
                .isLifeThreatening(isLifeThreatening)
                .recommendedAction(recommendedAction)
                .rationale(rationale)
                .build();
    }

    @Override
    public String calculateUrgency(String symptoms, String diseaseCategory, Double riskScore) {
        if (symptoms == null) symptoms = "";
        String lower = symptoms.toLowerCase();
        String catLower = diseaseCategory != null ? diseaseCategory.toLowerCase() : "";

        // 1. Check CRITICAL keywords
        for (String kw : CRITICAL_KEYWORDS) {
            if (lower.contains(kw)) {
                return "CRITICAL";
            }
        }
        if (catLower.contains("cardiac") || catLower.contains("emergency") || catLower.contains("stroke")) {
            return "CRITICAL";
        }
        if (riskScore != null && riskScore >= 0.85) {
            return "CRITICAL";
        }

        // 2. Check HIGH keywords
        for (String kw : HIGH_KEYWORDS) {
            if (lower.contains(kw)) {
                return "HIGH";
            }
        }
        if (catLower.contains("dengue") && (lower.contains("platelet") || lower.contains("bleed") || lower.contains("rash"))) {
            return "HIGH";
        }
        if (riskScore != null && riskScore >= 0.65) {
            return "HIGH";
        }

        // 3. Check MEDIUM keywords
        for (String kw : MEDIUM_KEYWORDS) {
            if (lower.contains(kw)) {
                return "MEDIUM";
            }
        }
        if (riskScore != null && riskScore >= 0.35) {
            return "MEDIUM";
        }

        // 4. LOW
        return "LOW";
    }

    @Override
    public boolean detectLifeThreateningSymptoms(String symptoms) {
        if (symptoms == null || symptoms.isBlank()) return false;
        String lower = symptoms.toLowerCase();
        for (String kw : CRITICAL_KEYWORDS) {
            if (lower.contains(kw)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String classifyRisk(String urgencyLevel) {
        if ("CRITICAL".equalsIgnoreCase(urgencyLevel)) return "CRITICAL";
        if ("HIGH".equalsIgnoreCase(urgencyLevel)) return "HIGH";
        if ("MEDIUM".equalsIgnoreCase(urgencyLevel)) return "MODERATE";
        return "LOW";
    }

    private double calculateUrgencyScore(String urgency, Double incomingScore) {
        if (incomingScore != null && incomingScore > 0.0) {
            return Math.round(incomingScore * 100.0) / 100.0;
        }
        switch (urgency) {
            case "CRITICAL": return 0.95;
            case "HIGH": return 0.75;
            case "MEDIUM": return 0.45;
            case "LOW":
            default: return 0.15;
        }
    }
}
