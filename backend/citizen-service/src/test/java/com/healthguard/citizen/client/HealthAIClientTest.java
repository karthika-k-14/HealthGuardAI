package com.healthguard.citizen.client;

import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.exception.AIServiceUnavailableException;
import com.healthguard.citizen.fallback.HealthAIClientFallback;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HealthAIClientTest {

    @Mock
    private HealthAIClient healthAIClient;

    private HealthAIClientFallback fallback;

    @BeforeEach
    void setUp() {
        fallback = new HealthAIClientFallback();
    }

    @Test
    @DisplayName("predictIntent - Success")
    void testPredictIntent_Success() {
        IntentRequestDTO request = IntentRequestDTO.builder().text("I have fever").build();
        IntentResponseDTO expectedResponse = IntentResponseDTO.builder()
                .intent("SYMPTOM_QUERY")
                .confidence(0.95)
                .build();

        when(healthAIClient.predictIntent(any(IntentRequestDTO.class))).thenReturn(expectedResponse);

        IntentResponseDTO actualResponse = healthAIClient.predictIntent(request);

        assertNotNull(actualResponse);
        assertEquals("SYMPTOM_QUERY", actualResponse.getIntent());
        assertEquals(0.95, actualResponse.getConfidence());
        verify(healthAIClient, times(1)).predictIntent(request);
    }

    @Test
    @DisplayName("predictDisease - Success")
    void testPredictDisease_Success() {
        DiseaseRequestDTO request = DiseaseRequestDTO.builder().symptoms("fever body pain").build();
        DiseaseResponseDTO expectedResponse = DiseaseResponseDTO.builder()
                .diseaseCategory("VIRAL_FEVER")
                .confidence(0.92)
                .build();

        when(healthAIClient.predictDisease(any(DiseaseRequestDTO.class))).thenReturn(expectedResponse);

        DiseaseResponseDTO actualResponse = healthAIClient.predictDisease(request);

        assertNotNull(actualResponse);
        assertEquals("VIRAL_FEVER", actualResponse.getDiseaseCategory());
        assertEquals(0.92, actualResponse.getConfidence());
        verify(healthAIClient, times(1)).predictDisease(request);
    }

    @Test
    @DisplayName("predictUrgency - Success")
    void testPredictUrgency_Success() {
        UrgencyRequestDTO request = UrgencyRequestDTO.builder().symptoms("chest pain").build();
        UrgencyResponseDTO expectedResponse = UrgencyResponseDTO.builder()
                .urgency("HIGH")
                .score(85)
                .reason("Critical symptom detected")
                .build();

        when(healthAIClient.predictUrgency(any(UrgencyRequestDTO.class))).thenReturn(expectedResponse);

        UrgencyResponseDTO actualResponse = healthAIClient.predictUrgency(request);

        assertNotNull(actualResponse);
        assertEquals("HIGH", actualResponse.getUrgency());
        assertEquals(85, actualResponse.getScore());
        verify(healthAIClient, times(1)).predictUrgency(request);
    }

    @Test
    @DisplayName("translate - Success")
    void testTranslate_Success() {
        TranslationRequestDTO request = TranslationRequestDTO.builder()
                .text("fever")
                .sourceLang("en")
                .targetLang("hi")
                .build();
        TranslationResponseDTO expectedResponse = TranslationResponseDTO.builder()
                .translatedText("बुखार")
                .sourceLang("en")
                .targetLang("hi")
                .status("SUCCESS")
                .build();

        when(healthAIClient.translate(any(TranslationRequestDTO.class))).thenReturn(expectedResponse);

        TranslationResponseDTO actualResponse = healthAIClient.translate(request);

        assertNotNull(actualResponse);
        assertEquals("बुखार", actualResponse.getTranslatedText());
        verify(healthAIClient, times(1)).translate(request);
    }

    @Test
    @DisplayName("forecastDemand - Success")
    void testForecastDemand_Success() {
        ForecastRequestDTO request = ForecastRequestDTO.builder()
                .medicine("Paracetamol 500mg")
                .historicalUsage(5000)
                .monthOffset(1)
                .districtOutbreakRisk(0)
                .build();
        ForecastResponseDTO expectedResponse = ForecastResponseDTO.builder()
                .medicine("Paracetamol 500mg")
                .predictedDemand(5400)
                .forecastMonth("Next Month")
                .confidence(0.90)
                .build();

        when(healthAIClient.forecastDemand(any(ForecastRequestDTO.class))).thenReturn(expectedResponse);

        ForecastResponseDTO actualResponse = healthAIClient.forecastDemand(request);

        assertNotNull(actualResponse);
        assertEquals(5400, actualResponse.getPredictedDemand());
        verify(healthAIClient, times(1)).forecastDemand(request);
    }

    @Test
    @DisplayName("Fallback - Throws AIServiceUnavailableException for predictIntent")
    void testFallback_PredictIntent_ThrowsException() {
        IntentRequestDTO request = IntentRequestDTO.builder().text("test").build();

        AIServiceUnavailableException ex = assertThrows(
                AIServiceUnavailableException.class,
                () -> fallback.predictIntent(request)
        );
        assertTrue(ex.getMessage().contains("Health AI Service is unavailable"));
    }

    @Test
    @DisplayName("Fallback - Throws AIServiceUnavailableException for predictDisease")
    void testFallback_PredictDisease_ThrowsException() {
        DiseaseRequestDTO request = DiseaseRequestDTO.builder().symptoms("test").build();

        AIServiceUnavailableException ex = assertThrows(
                AIServiceUnavailableException.class,
                () -> fallback.predictDisease(request)
        );
        assertTrue(ex.getMessage().contains("Health AI Service is unavailable"));
    }

    @Test
    @DisplayName("Fallback - Throws AIServiceUnavailableException for predictUrgency")
    void testFallback_PredictUrgency_ThrowsException() {
        UrgencyRequestDTO request = UrgencyRequestDTO.builder().symptoms("test").build();

        AIServiceUnavailableException ex = assertThrows(
                AIServiceUnavailableException.class,
                () -> fallback.predictUrgency(request)
        );
        assertTrue(ex.getMessage().contains("Health AI Service is unavailable"));
    }
}
