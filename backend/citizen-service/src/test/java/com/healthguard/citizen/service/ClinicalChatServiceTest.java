package com.healthguard.citizen.service;

import com.healthguard.citizen.client.CommunityServiceClient;
import com.healthguard.citizen.client.HealthAIClient;
import com.healthguard.citizen.dto.ChatClassifyDTOs.*;
import com.healthguard.citizen.dto.DiseaseAwarenessResponseDTO;
import com.healthguard.citizen.entity.AIAnalysis;
import com.healthguard.citizen.repository.AIAnalysisRepository;
import com.healthguard.citizen.repository.CitizenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClinicalChatServiceTest {

    @Mock
    private AIAnalysisRepository aiAnalysisRepository;

    @Mock
    private CitizenRepository citizenRepository;

    @Mock
    private CommunityServiceClient communityServiceClient;

    @Mock
    private HealthAIClient healthAIClient;

    @Mock
    private DiseaseAwarenessService diseaseAwarenessService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ClinicalChatService clinicalChatService;

    @BeforeEach
    void setUp() {
        lenient().when(aiAnalysisRepository.save(any(AIAnalysis.class))).thenAnswer(invocation -> {
            AIAnalysis a = invocation.getArgument(0);
            if (a.getId() == null) a.setId(101L);
            if (a.getCreatedAt() == null) a.setCreatedAt(LocalDateTime.now());
            return a;
        });
    }

    @Test
    @DisplayName("Test 1: Input 'I have fever and vomiting' -> Category: GASTRO or VECTOR_BORNE, Urgency: HIGH, Risk: 50-80, Symptoms: Fever, Vomiting")
    void testCase1_FeverAndVomiting() {
        ConsultRequest request = ConsultRequest.builder()
                .citizenId(1L)
                .query("I have fever and vomiting")
                .build();

        ConsultResponse response = clinicalChatService.consultChat(request);

        assertNotNull(response);
        assertTrue("GASTRO".equals(response.getDiseaseCategory()) || "VECTOR_BORNE".equals(response.getDiseaseCategory()),
                "Category should be GASTRO or VECTOR_BORNE but was: " + response.getDiseaseCategory());
        assertEquals("HIGH", response.getUrgencyLevel(), "Urgency should be HIGH");
        assertTrue(response.getRiskScore() >= 50.0 && response.getRiskScore() <= 80.0,
                "Risk score must be between 50 and 80, but was: " + response.getRiskScore());

        assertNotNull(response.getExtractedSymptoms(), "Extracted symptoms should not be null");
        assertTrue(response.getExtractedSymptoms().contains("Fever"), "Should extract Fever");
        assertTrue(response.getExtractedSymptoms().contains("Vomiting"), "Should extract Vomiting");

        // Verify Emergency escalation
        assertTrue(response.isEmergencyEscalated(), "High urgency must auto-escalate");
        assertEquals("Activated", response.getEscalationStatus());
        verify(communityServiceClient, atLeastOnce()).createEmergencyAlert(anyMap());
    }

    @Test
    @DisplayName("Test 2: Input 'I have chest pain and breathing difficulty' -> Category: CARDIAC, Urgency: CRITICAL, Risk: 90-100, Emergency Alert Created")
    void testCase2_ChestPainAndBreathingDifficulty() {
        ConsultRequest request = ConsultRequest.builder()
                .citizenId(1L)
                .query("I have chest pain and breathing difficulty")
                .build();

        ConsultResponse response = clinicalChatService.consultChat(request);

        assertNotNull(response);
        assertEquals("CARDIAC", response.getDiseaseCategory());
        assertEquals("CRITICAL", response.getUrgencyLevel());
        assertTrue(response.getRiskScore() >= 90.0 && response.getRiskScore() <= 100.0,
                "Risk score must be between 90 and 100, but was: " + response.getRiskScore());

        assertTrue(response.getExtractedSymptoms().contains("Chest Pain"));
        assertTrue(response.getExtractedSymptoms().contains("Breathing Difficulty"));

        assertTrue(response.isEmergencyEscalated(), "Emergency escalation must be active");
        verify(communityServiceClient, atLeastOnce()).createEmergencyAlert(anyMap());
    }

    @Test
    @DisplayName("Test 3: Input 'What is dengue?' -> Disease Awareness Response, Category: VECTOR_BORNE, Urgency: LOW, Risk <= 15")
    void testCase3_WhatIsDengueAwareness() {
        when(diseaseAwarenessService.searchAwareness(eq("dengue"), anyString())).thenReturn(
                DiseaseAwarenessResponseDTO.builder()
                        .diseaseName("Dengue Fever")
                        .category("VECTOR_BORNE")
                        .severity("HIGH")
                        .description("Mosquito-borne viral infection caused by dengue virus.")
                        .symptoms(List.of("High fever", "Severe headache", "Pain behind eyes"))
                        .prevention(List.of("Eliminate stagnant water", "Use mosquito repellents"))
                        .governmentRecommendations(List.of("Report cases to local PHC", "Fogging"))
                        .treatment("Hydration and supportive care under medical supervision.")
                        .build()
        );

        ConsultRequest request = ConsultRequest.builder()
                .citizenId(1L)
                .query("What is dengue?")
                .build();

        ConsultResponse response = clinicalChatService.consultChat(request);

        assertNotNull(response);
        assertEquals("VECTOR_BORNE", response.getDiseaseCategory(), "Dengue awareness must be VECTOR_BORNE");
        assertEquals("LOW", response.getUrgencyLevel());
        assertTrue(response.getRiskScore() <= 20.0, "Awareness query risk score should be low");
        assertEquals("DISEASE_AWARENESS", response.getQueryType());
        assertFalse(response.isEmergencyEscalated(), "Awareness query must not escalate to emergency");
    }

    @Test
    @DisplayName("Test 4: FastAPI NLP Primary Intelligence Engine successfully provides analysis and confidence")
    void testFastApiNlpPrimaryEngineSuccess() {
        when(healthAIClient.analyzeClinicalNlp(any())).thenReturn(
                com.healthguard.citizen.dto.ClinicalNlpDTOs.ClinicalNlpResponseDTO.builder()
                        .diseaseCategory("GASTRO")
                        .urgencyLevel("HIGH")
                        .riskScore(76)
                        .confidence(0.92)
                        .symptoms(List.of("Fever", "Vomiting"))
                        .reasoning("Acute gastroenteritis symptoms detected via NLP engine.")
                        .recommendations(List.of("Drink ORS in frequent sips", "Visit nearest PHC"))
                        .safetyOverride(true)
                        .build()
        );

        ClassifyRequest request = ClassifyRequest.builder()
                .citizenId(1L)
                .query("I have high fever and vomiting")
                .build();

        ClassifyResponse response = clinicalChatService.classifyQuery(request);

        assertNotNull(response);
        assertEquals("GASTRO", response.getDiseaseCategory());
        assertEquals("HIGH", response.getUrgencyLevel());
        assertEquals(76.0, response.getRiskScore());
        assertEquals(0.92, response.getConfidence());
        assertTrue(response.getExtractedSymptoms().contains("Fever"));
        assertTrue(response.getExtractedSymptoms().contains("Vomiting"));
        assertTrue(response.isAutoEscalated());
        verify(healthAIClient, atLeastOnce()).analyzeClinicalNlp(any());
    }

    @Test
    @DisplayName("Test 5: Clinical Safety Override Layer MUST override low NLP prediction for critical red flags")
    void testClinicalSafetyOverrideOverrulesNlp() {
        // Assume FastAPI NLP mistakenly predicted LOW urgency for chest pain
        when(healthAIClient.analyzeClinicalNlp(any())).thenReturn(
                com.healthguard.citizen.dto.ClinicalNlpDTOs.ClinicalNlpResponseDTO.builder()
                        .diseaseCategory("GENERAL")
                        .urgencyLevel("LOW")
                        .riskScore(25)
                        .confidence(0.60)
                        .symptoms(List.of("Chest Pain"))
                        .reasoning("NLP initial prediction.")
                        .build()
        );

        ClassifyRequest request = ClassifyRequest.builder()
                .citizenId(1L)
                .query("I have sudden chest pain and left arm pain")
                .build();

        ClassifyResponse response = clinicalChatService.classifyQuery(request);

        assertNotNull(response);
        // Safety rules MUST override to CARDIAC, CRITICAL, Risk 90-100
        assertEquals("CARDIAC", response.getDiseaseCategory(), "Safety rule must force CARDIAC");
        assertEquals("CRITICAL", response.getUrgencyLevel(), "Safety rule must force CRITICAL");
        assertTrue(response.getRiskScore() >= 90.0 && response.getRiskScore() <= 100.0, "Risk score must be 90-100");
        assertTrue(response.isAutoEscalated(), "Critical cases must auto-escalate");
    }

    @Test
    @DisplayName("Test 6: Fallback Strategy - When FastAPI NLP is offline, chat must continue working with zero errors")
    void testFallbackWhenFastApiOffline() {
        when(healthAIClient.analyzeClinicalNlp(any())).thenThrow(new RuntimeException("Connection refused: localhost:8000"));

        ClassifyRequest request = ClassifyRequest.builder()
                .citizenId(1L)
                .query("I have high fever and shivering with chills")
                .build();

        // Must not throw any exception
        ClassifyResponse response = assertDoesNotThrow(() -> clinicalChatService.classifyQuery(request));

        assertNotNull(response);
        assertEquals("VECTOR_BORNE", response.getDiseaseCategory());
        assertEquals("HIGH", response.getUrgencyLevel());
        assertTrue(response.getRiskScore() >= 70.0 && response.getRiskScore() <= 90.0);
        assertTrue(response.getExtractedSymptoms().contains("Chills"));
    }

    @Test
    @DisplayName("Test 7: Clinical Input 'I have jaundice' -> Category: GASTRO, Urgency: HIGH, Risk: 70-80, Symptoms: Jaundice, Auto-escalated")
    void testCase7_JaundiceClinicalInput() {
        ConsultRequest request = ConsultRequest.builder()
                .citizenId(1L)
                .query("I have jaundice")
                .build();

        ConsultResponse response = clinicalChatService.consultChat(request);

        assertNotNull(response);
        assertEquals("GASTRO", response.getDiseaseCategory(), "Jaundice must be classified under GASTRO / hepatobiliary");
        assertEquals("HIGH", response.getUrgencyLevel(), "Jaundice must have HIGH urgency");
        assertTrue(response.getRiskScore() >= 70.0 && response.getRiskScore() <= 80.0,
                "Risk score must be in 70-80 range for jaundice, was: " + response.getRiskScore());
        assertTrue(response.getExtractedSymptoms().contains("Jaundice"), "Should extract Jaundice symptom");
        assertTrue(response.isEmergencyEscalated(), "High urgency jaundice must trigger escalation");
        assertTrue(response.getResponse().contains("Liver Function Tests") || response.getResponse().contains("LFT"),
                "Response must contain clinical guidance regarding LFT / liver function");
        assertFalse(response.getResponse().contains("General health inquiry received"),
                "Must NOT return generic fallback response");
    }

    @Test
    @DisplayName("Test 8: Awareness Input 'What is jaundice?' -> Category: GASTRO, Urgency: LOW, QueryType: DISEASE_AWARENESS")
    void testCase8_WhatIsJaundiceAwareness() {
        when(diseaseAwarenessService.searchAwareness(eq("jaundice"), anyString())).thenReturn(
                DiseaseAwarenessResponseDTO.builder()
                        .diseaseName("Jaundice & Viral Hepatitis")
                        .category("GASTRO")
                        .severity("HIGH")
                        .description("Medical condition causing yellow pigmentation of skin and eyes due to elevated bilirubin.")
                        .symptoms(List.of("Yellowing of eyes and skin", "Dark urine", "Pale stool"))
                        .prevention(List.of("Boiled drinking water", "Hepatitis vaccination"))
                        .governmentRecommendations(List.of("Free LFT under NVHCP"))
                        .treatment("Rest, low-fat diet, and medical supervision.")
                        .build()
        );

        ConsultRequest request = ConsultRequest.builder()
                .citizenId(1L)
                .query("What is jaundice?")
                .build();

        ConsultResponse response = clinicalChatService.consultChat(request);

        assertNotNull(response);
        assertEquals("GASTRO", response.getDiseaseCategory());
        assertEquals("LOW", response.getUrgencyLevel());
        assertEquals("DISEASE_AWARENESS", response.getQueryType());
        assertTrue(response.getResponse().contains("Jaundice & Viral Hepatitis Overview"));
    }
}
