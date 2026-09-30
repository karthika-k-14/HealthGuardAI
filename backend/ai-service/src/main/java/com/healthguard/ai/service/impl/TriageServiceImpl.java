package com.healthguard.ai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguard.ai.client.OllamaClient;
import com.healthguard.ai.dto.TriageFact;
import com.healthguard.ai.dto.TriageRequest;
import com.healthguard.ai.dto.TriageResponse;
import com.healthguard.ai.entity.ConversationStage;
import com.healthguard.ai.entity.TriageSession;
import com.healthguard.ai.repository.MedicalKnowledgeRepository;
import com.healthguard.ai.repository.TriageSessionRepository;
import com.healthguard.ai.service.LanguageService;
import com.healthguard.ai.service.TriageService;
import lombok.RequiredArgsConstructor;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TriageServiceImpl implements TriageService {

    private static final Logger log = LoggerFactory.getLogger(TriageServiceImpl.class);

    private final KieContainer kieContainer;
    private final MedicalKnowledgeRepository knowledgeRepository;
    private final TriageSessionRepository sessionRepository;
    private final OllamaClient ollamaClient;
    private final LanguageService languageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public TriageResponse evaluateTriage(TriageRequest request) {
        String query = request.getUserQuery() != null ? request.getUserQuery() : "";
        String queryTrimmed = query.trim();
        String queryLower = queryTrimmed.toLowerCase();

        Long userId = request.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        String lang = (request.getLanguage() != null && !request.getLanguage().isBlank())
                ? request.getLanguage().toLowerCase()
                : languageService.detectLanguage(query);

        boolean isGreeting = isGreeting(queryLower);

        // 1. Fetch or create TriageSession from Database
        TriageSession session = null;
        if (request.getSessionUuid() != null && !request.getSessionUuid().isBlank()) {
            session = sessionRepository.findBySessionUuid(request.getSessionUuid()).orElse(null);
        }
        if (session == null) {
            session = sessionRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId).orElse(null);
        }

        boolean shouldReset = Boolean.TRUE.equals(request.getResetSession()) || session == null;

        if (shouldReset) {
            String newUuid = (request.getSessionUuid() != null && !request.getSessionUuid().isBlank())
                    ? request.getSessionUuid()
                    : UUID.randomUUID().toString();
            session = TriageSession.builder()
                    .userId(userId)
                    .sessionUuid(newUuid)
                    .currentStage(ConversationStage.STAGE_1_SYMPTOM_COLLECTION)
                    .language(lang)
                    .symptoms("")
                    .followUpAnswers("")
                    .riskLevel("LOW")
                    .emergencyAlert(false)
                    .build();
            session = sessionRepository.save(session);
        }

        ConversationStage currentStage = session.getCurrentStage();
        String responseContent = "";
        ConversationStage nextStage;

        List<String> symptomsList = new ArrayList<>();
        List<String> questionsList = new ArrayList<>();
        List<String> recsList = new ArrayList<>();

        switch (currentStage) {
            case STAGE_1_SYMPTOM_COLLECTION:
            case STAGE_2_FOLLOW_UP_QUESTIONS:
                // Multi-Symptom Extraction & Accumulation across the session
                List<String> newlyDetected = parseIdentifiedSymptoms(queryLower, lang);
                List<String> storedSymptomsList = getAccumulatedSymptomsList(session, newlyDetected);

                session.setSymptoms(String.join(", ", storedSymptomsList));
                if (!queryTrimmed.isBlank()) {
                    String prev = session.getFollowUpAnswers() != null ? session.getFollowUpAnswers() : "";
                    session.setFollowUpAnswers(prev.isBlank() ? queryTrimmed : prev + "; " + queryTrimmed);
                }

                log.info("Detected Symptoms: {}", newlyDetected);
                log.info("Stored Symptoms: {}", storedSymptomsList);
                log.info("Current Assessment Session ID: {}", session.getSessionUuid());

                symptomsList = storedSymptomsList;
                TriageFact currentFactCheck = extractFactFromQuery((session.getSymptoms() + " " + session.getFollowUpAnswers()).toLowerCase(), request);
                KieSession preCheckSession = kieContainer.newKieSession();
                try {
                    preCheckSession.insert(currentFactCheck);
                    preCheckSession.fireAllRules();
                } finally {
                    preCheckSession.dispose();
                }

                // Requirement 8: If 3+ symptoms provided or sufficient details present, jump straight to final risk assessment!
                boolean hasEnoughData = storedSymptomsList.size() >= 3 || currentFactCheck.isEmergencyAlert() || "HIGH_RISK".equals(currentFactCheck.getRiskLevel()) || "MODERATE_RISK".equals(currentFactCheck.getRiskLevel());

                if (!hasEnoughData && session.getCurrentStage() == ConversationStage.STAGE_1_SYMPTOM_COLLECTION) {
                    nextStage = ConversationStage.STAGE_2_FOLLOW_UP_QUESTIONS;
                    session.setCurrentStage(nextStage);
                    sessionRepository.save(session);
                    questionsList = generateTailoredFollowUpQuestions(storedSymptomsList, currentFactCheck, lang);
                    responseContent = buildStage1Response(storedSymptomsList, questionsList, lang);
                    break;
                }

                // Fast-track to Risk Assessment & Recommendations
                nextStage = ConversationStage.STAGE_3_RISK_ASSESSMENT;
                session.setCurrentStage(nextStage);
                sessionRepository.save(session);
                // Fall-through intention for immediate assessment generation

            case STAGE_3_RISK_ASSESSMENT:
                String combinedText = (session.getSymptoms() + " " + session.getFollowUpAnswers() + " " + queryLower).toLowerCase();
                TriageFact fact = extractFactFromQuery(combinedText, request);

                KieSession kieSession = kieContainer.newKieSession();
                try {
                    kieSession.insert(fact);
                    int rulesFired = kieSession.fireAllRules();
                    log.info("Drools engine executed in STAGE_3. Rules fired: {}, Risk Level: {}", rulesFired, fact.getRiskLevel());
                } finally {
                    kieSession.dispose();
                }

                if (fact.getRiskLevel() == null) fact.setRiskLevel("LOW");
                else if ("HIGH_RISK".equals(fact.getRiskLevel())) fact.setRiskLevel("HIGH");
                else if ("MODERATE_RISK".equals(fact.getRiskLevel())) fact.setRiskLevel("MODERATE");
                else if ("LOW_RISK".equals(fact.getRiskLevel())) fact.setRiskLevel("LOW");

                boolean isEmergency = "EMERGENCY".equalsIgnoreCase(fact.getRiskLevel()) || fact.isEmergencyAlert();
                session.setRiskLevel(fact.getRiskLevel());
                session.setEmergencyAlert(isEmergency);

                nextStage = ConversationStage.STAGE_4_RECOMMENDATIONS;
                session.setCurrentStage(nextStage);
                sessionRepository.save(session);

                responseContent = buildStage3Response(fact.getRiskLevel(), isEmergency, lang);
                break;

            case STAGE_4_RECOMMENDATIONS:
                TriageFact currentFact = TriageFact.builder()
                        .riskLevel(session.getRiskLevel() != null ? session.getRiskLevel() : "LOW")
                        .emergencyAlert(Boolean.TRUE.equals(session.getEmergencyAlert()))
                        .build();

                String recommendationText = "";
                try {
                    String rawLlm = ollamaClient.generateMedicalResponse(session.getSymptoms(), "", lang, currentFact.getRiskLevel());
                    if (rawLlm != null && !rawLlm.isBlank()) {
                        recommendationText = sanitizeClinicalText(rawLlm);
                    }
                } catch (Exception e) {
                    log.warn("Gemini AI LLM call failed or skipped in STAGE_4: {}", e.getMessage());
                }

                if (recommendationText.isBlank()) {
                    recommendationText = generateRecommendationsText(currentFact, lang);
                }

                recsList.add(recommendationText);
                nextStage = ConversationStage.STAGE_5_SAFETY_DISCLAIMER;
                session.setCurrentStage(nextStage);
                sessionRepository.save(session);

                responseContent = buildStage4Response(recommendationText, lang);
                break;

            case STAGE_5_SAFETY_DISCLAIMER:
            default:
                String activeRisk = session.getRiskLevel() != null ? session.getRiskLevel() : "LOW";
                responseContent = buildStage5Response(activeRisk, lang);

                nextStage = ConversationStage.STAGE_1_SYMPTOM_COLLECTION;
                session.setCurrentStage(nextStage);
                sessionRepository.save(session);
                break;
        }

        return TriageResponse.builder()
                .riskLevel(session.getRiskLevel() != null ? session.getRiskLevel() : "LOW")
                .language(lang)
                .assessment(responseContent)
                .symptomsIdentified(symptomsList)
                .recommendations(recsList)
                .followUpQuestions(questionsList)
                .emergencyAlert(Boolean.TRUE.equals(session.getEmergencyAlert()))
                .disclaimer(getDisclaimerByLang(lang))
                .whenToSeekCare(Boolean.TRUE.equals(session.getEmergencyAlert()) ? "Seek emergency medical care immediately." : "Consult a healthcare provider if symptoms persist.")
                .formattedResponse(responseContent)
                .currentStage(currentStage.name())
                .nextStage(nextStage.name())
                .sessionUuid(session.getSessionUuid())
                .build();
    }

    @Override
    public TriageResponse getSessionByUuid(String sessionUuid, Long requesterUserId) {
        TriageSession session = sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new RuntimeException("Triage session not found with UUID: " + sessionUuid));

        if (requesterUserId != null && !requesterUserId.equals(session.getUserId())) {
            log.warn("IDOR attempt blocked: requesterUserId={} tried to access triage session uuid={} owned by userId={}", requesterUserId, sessionUuid, session.getUserId());
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Cannot access another user's triage session");
        }

        return mapToResponse(session);
    }

    @Override
    public org.springframework.data.domain.Page<TriageResponse> getTriageHistoryByUserId(Long userId, org.springframework.data.domain.Pageable pageable) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId, pageable).map(this::mapToResponse);
    }

    @Override
    public org.springframework.data.domain.Page<TriageResponse> getEmergencyAlertSessions(org.springframework.data.domain.Pageable pageable) {
        return sessionRepository.findByEmergencyAlertTrueOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    @Override
    public org.springframework.data.domain.Page<TriageResponse> searchSessions(String keyword, org.springframework.data.domain.Pageable pageable) {
        return sessionRepository.searchSessions(keyword, pageable).map(this::mapToResponse);
    }

    @Override
    public void deleteSession(String sessionUuid, Long requesterUserId) {
        TriageSession session = sessionRepository.findBySessionUuid(sessionUuid)
                .orElseThrow(() -> new RuntimeException("Triage session not found with UUID: " + sessionUuid));

        if (requesterUserId != null && !requesterUserId.equals(session.getUserId())) {
            log.warn("IDOR attempt blocked: requesterUserId={} tried to delete triage session uuid={} owned by userId={}", requesterUserId, sessionUuid, session.getUserId());
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: Cannot delete another user's triage session");
        }

        sessionRepository.delete(session);
        log.info("Deleted triage session uuid={}", sessionUuid);
    }

    private TriageResponse mapToResponse(TriageSession session) {
        List<String> symptomsList = session.getSymptoms() != null && !session.getSymptoms().isBlank()
                ? Arrays.stream(session.getSymptoms().split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList())
                : List.of();

        String lang = session.getLanguage() != null ? session.getLanguage() : "en";
        String activeRisk = session.getRiskLevel() != null ? session.getRiskLevel() : "LOW";
        boolean isEmergency = Boolean.TRUE.equals(session.getEmergencyAlert());

        return TriageResponse.builder()
                .riskLevel(activeRisk)
                .language(lang)
                .assessment("Session stage: " + session.getCurrentStage())
                .symptomsIdentified(symptomsList)
                .recommendations(List.of())
                .followUpQuestions(List.of())
                .emergencyAlert(isEmergency)
                .disclaimer(getDisclaimerByLang(lang))
                .whenToSeekCare(isEmergency ? "Seek emergency medical care immediately." : "Consult a healthcare provider if symptoms persist.")
                .formattedResponse("Session stage: " + session.getCurrentStage())
                .currentStage(session.getCurrentStage() != null ? session.getCurrentStage().name() : "STAGE_1_SYMPTOM_COLLECTION")
                .nextStage(session.getCurrentStage() != null ? session.getCurrentStage().name() : "STAGE_1_SYMPTOM_COLLECTION")
                .sessionUuid(session.getSessionUuid())
                .build();
    }


    private List<String> getAccumulatedSymptomsList(TriageSession session, List<String> newlyDetected) {
        List<String> result = new ArrayList<>();
        if (session != null && session.getSymptoms() != null && !session.getSymptoms().isBlank()) {
            String[] existing = session.getSymptoms().split(",");
            for (String s : existing) {
                String trimmed = s.trim();
                if (!trimmed.isEmpty() && !result.contains(trimmed)) {
                    result.add(trimmed);
                }
            }
        }
        for (String s : newlyDetected) {
            if (!result.contains(s)) {
                result.add(s);
            }
        }
        return result;
    }

    private String buildStage1Response(List<String> symptoms, List<String> questions, String lang) {
        StringBuilder sb = new StringBuilder();
        sb.append("I have recorded the following symptoms:\n");
        if (symptoms != null && !symptoms.isEmpty()) {
            symptoms.forEach(s -> sb.append("• ").append(s).append("\n"));
        } else {
            sb.append("• General Clinical Symptom\n");
        }
        sb.append("\nCould you please answer these follow-up questions:\n");
        if (questions != null && !questions.isEmpty()) {
            for (int i = 0; i < questions.size(); i++) {
                sb.append(i + 1).append(". ").append(questions.get(i)).append("\n");
            }
        } else {
            sb.append("1. How long have you had these symptoms?\n");
            sb.append("2. On a scale from 1 to 10, how severe is your discomfort?\n");
            sb.append("3. Do you have any additional symptoms?\n");
        }
        return sb.toString();
    }

    private String buildStage2Response(List<String> questions, String lang) {
        StringBuilder sb = new StringBuilder();
        sb.append("Step 2: Follow-up Questions\n");
        if (questions != null && !questions.isEmpty()) {
            for (int i = 0; i < questions.size(); i++) {
                sb.append(i + 1).append(". ").append(questions.get(i)).append("\n");
            }
        } else {
            sb.append("1. How long have you experienced these symptoms?\n");
            sb.append("2. On a scale from 1 to 10, how severe is your discomfort?\n");
        }
        sb.append("\n[Stage 2/5 Complete: Follow-up Questions]\n");
        sb.append("Send a reply with your details to trigger Drools Risk Assessment.");
        return sb.toString();
    }

    private String buildStage3Response(String riskLevel, boolean emergency, String lang) {
        StringBuilder sb = new StringBuilder();
        sb.append("Step 3: Risk Assessment\n");
        sb.append("Risk Determination (Drools Rules Engine):\n");
        if ("EMERGENCY".equalsIgnoreCase(riskLevel) || emergency) {
            sb.append("🚨 EMERGENCY\n\n");
        } else if ("HIGH".equalsIgnoreCase(riskLevel)) {
            sb.append("🔴 HIGH\n\n");
        } else if ("MODERATE".equalsIgnoreCase(riskLevel)) {
            sb.append("🟡 MODERATE\n\n");
        } else {
            sb.append("🟢 LOW\n\n");
        }
        sb.append("[Stage 3/5 Complete: Risk Assessment]\n");
        sb.append("Send any message to receive evidence-based recommendations.");
        return sb.toString();
    }

    private String buildStage4Response(String recommendation, String lang) {
        StringBuilder sb = new StringBuilder();
        sb.append("Step 4: Recommendations\n");
        sb.append(recommendation).append("\n\n");
        sb.append("[Stage 4/5 Complete: Recommendations]\n");
        sb.append("Send any message to view safety warning signs and disclaimer.");
        return sb.toString();
    }

    private String buildStage5Response(String riskLevel, String lang) {
        StringBuilder sb = new StringBuilder();
        sb.append("Step 5: Emergency Warning Signs\n");
        sb.append(getEmergencyWarningSignsByLang(lang, riskLevel)).append("\n\n");
        sb.append("Step 6: Medical Disclaimer\n");
        sb.append(getDisclaimerByLang(lang)).append("\n\n");
        sb.append("[Stage 5/5 Complete: Assessment Workflow Finished]\n");
        sb.append("Send a new message to start a new health evaluation.");
        return sb.toString();
    }

    private boolean isGreeting(String queryLower) {
        if (queryLower.isBlank()) return true;
        return queryLower.matches("^(hi|hello|hey|namaste|namaskar|vanakkam|namaskara|greetings|good morning|good afternoon|good evening|thanks|thank you|hi there|hello there)(\\s+.*)?$");
    }

    private String buildWelcomeMessage(String lang) {
        switch (lang) {
            case "hi":
                return "नमस्ते! हेल्थगार्ड एआई में आपका स्वागत है। मैं आपका स्वास्थ्य मार्गदर्शन सहायक हूँ। (Stage 1: लक्षण संग्रह) कृपया अपने लक्षणों का वर्णन करें।";
            case "ta":
                return "வணக்கம்! ஹெல்த்கார்ட் AI-க்கு நல்வரவு. (Stage 1: அறிகுறி சேகரிப்பு) உங்கள் அறிகுறிகளை விவரிக்கவும்.";
            case "od":
            case "or":
                return "ନମସ୍କାର! ହେଲଥଗାର୍ଡ AI କୁ ସ୍ୱାଗତ। (Stage 1: ଲକ୍ଷଣ ସଂଗ୍ରହ) ଆପଣଙ୍କର ଲକ୍ଷଣ ବର୍ଣ୍ଣନା କରନ୍ତୁ।";
            default:
                return "Hello! Welcome to HealthGuard AI. (Stage 1: Symptom Collection) Please describe any symptoms you are experiencing so we can evaluate your risk.";
        }
    }

    private TriageFact extractFactFromQuery(String query, TriageRequest req) {
        TriageFact.TriageFactBuilder builder = TriageFact.builder();

        builder.chestPain(query.contains("chest pain") || query.contains("pain in chest") || query.contains("நெஞ்சு வலி") || query.contains("सीने में दर्द"));
        builder.chestPressure(query.contains("chest pressure") || query.contains("crushing pain"));
        builder.shortnessOfBreath(query.contains("breath") || query.contains("breathing") || query.contains("dyspnea") || query.contains("மூச்சு விடுவதில் சிரமம்") || query.contains("सांस लेने में कठिनाई") || query.contains("ଶ୍ୱାସକ୍ରିୟାରେ କଷ୍ଟ"));
        builder.strokeSymptoms(query.contains("stroke") || query.contains("slurred") || query.contains("face droop"));
        builder.suddenParalysis(query.contains("paralysis") || query.contains("numb face"));
        builder.suddenWeakness(query.contains("sudden weakness") || query.contains("arm weakness"));
        builder.lossOfConsciousness(query.contains("faint") || query.contains("passed out") || query.contains("unconscious") || query.contains("मूर्छित"));
        builder.seizure(query.contains("seizure") || query.contains("fit") || query.contains("convulsion"));
        builder.severeBleeding(query.contains("heavy bleeding") || query.contains("severe bleed") || query.contains("இரத்தப்போக்கு") || query.contains("रक्तस्राव") || query.contains("ରକ୍ତସ୍ରାବ"));
        builder.majorTrauma(query.contains("head injury") || query.contains("major injury") || query.contains("accident"));
        builder.severeBurn(query.contains("third degree") || query.contains("severe burn"));
        builder.severeAllergicReaction(query.contains("anaphylaxis") || query.contains("allergic reaction"));
        builder.throatSwelling(query.contains("throat swelling") || query.contains("swollen throat"));
        builder.facialSwelling(query.contains("swollen face") || query.contains("facial swelling"));
        builder.suicidalThoughts(query.contains("suicide") || query.contains("end my life") || query.contains("self-harm"));

        builder.backPain(query.contains("back pain") || query.contains("lower back") || query.contains("முதுகு வலி") || query.contains("पीठ दर्द") || query.contains("ମୁଣ୍ଡବିନ୍ଧା"));
        builder.legNumbness(query.contains("leg numbness") || query.contains("numb leg") || query.contains("tingling leg"));
        builder.fever(query.contains("fever") || query.contains("temperature") || query.contains("chills") || query.contains("காய்ச்சல்") || query.contains("बुखार") || query.contains("ଜ୍ୱର"));
        builder.jaundice(query.contains("jaundice") || query.contains("yellow skin") || query.contains("icterus") || query.contains("पीलिया") || query.contains("மஞ்சள் காமாலை"));
        builder.yellowEyes(query.contains("yellow eyes") || query.contains("yellow eye") || query.contains("scleral icterus"));

        if (req != null && req.getFeverDays() != null) {
            builder.feverDays(req.getFeverDays());
        } else if (query.contains("fever") || query.contains("காய்ச்சல்") || query.contains("बुखार") || query.contains("ଜ୍ୱର")) {
            if (query.contains("4 days") || query.contains("5 days")) builder.feverDays(4);
            else if (query.contains("3 days")) builder.feverDays(3);
            else builder.feverDays(1);
        }

        if (req != null && req.getPainScore() != null) {
            builder.painScore(req.getPainScore());
        }

        return builder.build();
    }

    private List<String> generateTailoredFollowUpQuestions(List<String> symptoms, TriageFact fact, String lang) {
        List<String> questions = new ArrayList<>();
        List<String> symsLower = symptoms.stream().map(String::toLowerCase).collect(Collectors.toList());

        questions.add("How long have you had these symptoms?");

        if (symsLower.contains("fever")) {
            questions.add("What is your body temperature or fever level?");
        } else if (symsLower.contains("back pain") || symsLower.contains("पीठ दर्द") || symsLower.contains("முதுகு வலி")) {
            questions.add("Is the back pain mild, moderate, or severe?");
        } else if (symsLower.contains("chest pain") || symsLower.contains("shortness of breath")) {
            questions.add("Is the chest pain or breathing difficulty sharp or constant?");
        } else if (symsLower.contains("headache") || symsLower.contains("dizziness")) {
            questions.add("Is the headache or dizziness throbbing or constant?");
        } else {
            questions.add("On a scale from 1 to 10, how severe is your discomfort?");
        }

        questions.add("Do you have any additional symptoms?");

        // Return MAX 2 questions at a time to keep chat bubbles compact
        return questions.subList(0, Math.min(2, questions.size()));
    }

    private String normalizeSymptomText(String rawText) {
        if (rawText == null) return "";
        String text = rawText.toLowerCase();
        text = text.replaceAll("[,/;\\-_+&]", " ");

        text = text.replaceAll("(?i)\\bbackpain\\b", "back pain")
                   .replaceAll("(?i)\\bchestpain\\b", "chest pain")
                   .replaceAll("(?i)\\bhandpain\\b", "hand pain")
                   .replaceAll("(?i)\\blegpain\\b", "leg pain")
                   .replaceAll("(?i)\\barmpain\\b", "arm pain")
                   .replaceAll("(?i)\\bfootpain\\b", "foot pain")
                   .replaceAll("(?i)\\bkneepain\\b", "knee pain")
                   .replaceAll("(?i)\\bshoulderpain\\b", "shoulder pain")
                   .replaceAll("(?i)\\bneckpain\\b", "neck pain")
                   .replaceAll("(?i)\\bjointpain\\b", "joint pain")
                   .replaceAll("(?i)\\bmusclepain\\b", "muscle pain")
                   .replaceAll("(?i)\\bstomachpain\\b", "stomach pain")
                   .replaceAll("(?i)\\bheadpain\\b", "head pain")
                   .replaceAll("(?i)\\bsorethroat\\b", "sore throat")
                   .replaceAll("(?i)\\blegswelling\\b", "leg swelling")
                   .replaceAll("(?i)\\bhandswelling\\b", "hand swelling");

        return text.replaceAll("\\s+", " ").trim();
    }

    private List<String> parseIdentifiedSymptoms(String queryRaw, String lang) {
        String query = normalizeSymptomText(queryRaw);
        List<String> symptoms = new ArrayList<>();

        String[] bodyParts = {"hand", "arm", "leg", "foot", "knee", "shoulder", "neck", "back", "joint", "muscle", "stomach", "chest", "wrist", "elbow", "hip", "ankle"};
        String[] symptomTypes = {"pain", "ache", "swelling", "numbness", "stiffness", "soreness"};

        for (String part : bodyParts) {
            for (String type : symptomTypes) {
                if (query.contains(part + " " + type) || query.contains(type + " in " + part) || query.contains(type + " in my " + part)) {
                    String name = Character.toUpperCase(part.charAt(0)) + part.substring(1) + " " + Character.toUpperCase(type.charAt(0)) + type.substring(1);
                    if (!symptoms.contains(name)) {
                        symptoms.add(name);
                    }
                }
            }
        }

        if (query.contains("fever") || query.contains("बुखार") || query.contains("காய்ச்சல்") || query.contains("ଜ୍ୱର")) {
            if (!symptoms.contains("Fever")) symptoms.add("Fever");
        }
        if (query.contains("cough") || query.contains("खांसी") || query.contains("இருமல்")) {
            if (!symptoms.contains("Cough")) symptoms.add("Cough");
        }
        if (query.contains("sore throat") || query.contains("throat pain")) {
            if (!symptoms.contains("Sore Throat")) symptoms.add("Sore Throat");
        }
        if (query.contains("headache") || query.contains("सिरदर्द") || query.contains("தலைவலி") || query.contains("ମୁଣ୍ଡବିନ୍ଧା")) {
            if (!symptoms.contains("Headache")) symptoms.add("Headache");
        }
        if (query.contains("dizziness") || query.contains("dizzy") || query.contains("giddiness")) {
            if (!symptoms.contains("Dizziness")) symptoms.add("Dizziness");
        }
        if (query.contains("vomit") || query.contains("vomiting") || query.contains("उल्टी")) {
            if (!symptoms.contains("Vomiting")) symptoms.add("Vomiting");
        }
        if (query.contains("nausea") || query.contains("queasy")) {
            if (!symptoms.contains("Nausea")) symptoms.add("Nausea");
        }
        if (query.contains("breath") || query.contains("सांस") || query.contains("மூச்சு") || query.contains("ଶ୍ୱାସ")) {
            if (!symptoms.contains("Shortness of Breath")) symptoms.add("Shortness of Breath");
        }
        if (query.contains("sweat") || query.contains("sweating")) {
            if (!symptoms.contains("Sweating")) symptoms.add("Sweating");
        }
        if (query.contains("rash") || query.contains("skin rash")) {
            if (!symptoms.contains("Rash")) symptoms.add("Rash");
        }
        if (query.contains("unconscious") || query.contains("faint") || query.contains("passed out")) {
            if (!symptoms.contains("Unconsciousness")) symptoms.add("Unconsciousness");
        }
        if (query.contains("bleeding") || query.contains("bleed")) {
            if (!symptoms.contains("Severe Bleeding")) symptoms.add("Severe Bleeding");
        }
        if (query.contains("fatigue") || query.contains("tiredness") || query.contains("weakness")) {
            if (!symptoms.contains("Fatigue")) symptoms.add("Fatigue");
        }
        if (query.contains("diarrhea") || query.contains("loose motion")) {
            if (!symptoms.contains("Diarrhea")) symptoms.add("Diarrhea");
        }
        if (query.contains("jaundice") || query.contains("पीलिया") || query.contains("மஞ்சள் காமாலை") || query.contains("icterus")) {
            if (!symptoms.contains("Jaundice")) symptoms.add("Jaundice");
        }
        if (query.contains("yellow eyes") || query.contains("yellow eye") || query.contains("yellowing of eyes")) {
            if (!symptoms.contains("Yellow Eyes")) symptoms.add("Yellow Eyes");
        }
        if (query.contains("hepatitis") || query.contains("liver pain") || query.contains("hepatic")) {
            if (!symptoms.contains("Hepatitis / Liver Pain")) symptoms.add("Hepatitis / Liver Pain");
        }

        if (symptoms.isEmpty()) {
            symptoms.add("General Clinical Symptom");
        }
        return symptoms;
    }

    private String generateRecommendationsText(TriageFact fact, String lang) {
        if ("EMERGENCY".equalsIgnoreCase(fact.getRiskLevel())) {
            return "Call emergency services immediately (108 / 112). Go to the nearest hospital emergency department right away.";
        }
        if ("HIGH".equalsIgnoreCase(fact.getRiskLevel())) {
            return "Rest adequately, stay hydrated, and consult a qualified healthcare provider or nearby clinic today.";
        }
        return "Ensure adequate rest, remain well hydrated with clean fluids, and monitor symptoms closely. Seek medical evaluation if symptoms worsen or persist.";
    }

    private String sanitizeClinicalText(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("(?i)\\b\\d+\\s*(mg|g|ml|tablets|pills)\\b", "")
                             .replaceAll("(?i)\\b(paracetamol|ibuprofen|aspirin|amoxicillin|antibiotic|crocin|dolo)\\b", "supportive care");
        if (cleaned.length() > 350) {
            cleaned = cleaned.substring(0, 350) + "...";
        }
        return cleaned;
    }

    private String getEmergencyWarningSignsByLang(String lang, String riskLevel) {
        return "Seek immediate emergency care (Call 108/112) if you experience: sudden crushing chest pain, severe shortness of breath, sudden weakness/numbness on one side of the body, or loss of consciousness.";
    }

    private String getDisclaimerByLang(String lang) {
        return "This assessment is AI-generated and is not a medical diagnosis. Always consult a qualified physician for clinical decisions.";
    }
}
