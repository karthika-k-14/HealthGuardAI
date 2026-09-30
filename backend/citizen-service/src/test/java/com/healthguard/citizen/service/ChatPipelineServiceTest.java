package com.healthguard.citizen.service;

import com.healthguard.citizen.client.HealthAIClient;
import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.entity.AIAnalysis;
import com.healthguard.citizen.exception.AIServiceUnavailableException;
import com.healthguard.citizen.repository.AIAnalysisRepository;
import com.healthguard.citizen.service.impl.ChatPipelineServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatPipelineServiceTest {

    @Mock
    private HealthAIClient healthAIClient;

    @Mock
    private AIAnalysisRepository aiAnalysisRepository;

    @InjectMocks
    private ChatPipelineServiceImpl chatPipelineService;

    private ChatAnalysisRequestDTO requestDTO;
    private IntentResponseDTO intentDTO;
    private DiseaseResponseDTO diseaseDTO;
    private UrgencyResponseDTO urgencyDTO;
    private AIAnalysis savedEntity;

    @BeforeEach
    void setUp() {
        requestDTO = ChatAnalysisRequestDTO.builder()
                .citizenId(1L)
                .message("I have fever and headache")
                .language("en")
                .build();

        intentDTO = IntentResponseDTO.builder()
                .intent("SYMPTOM_QUERY")
                .confidence(0.95)
                .build();

        diseaseDTO = DiseaseResponseDTO.builder()
                .diseaseCategory("VIRAL_FEVER")
                .confidence(0.92)
                .build();

        urgencyDTO = UrgencyResponseDTO.builder()
                .urgency("MEDIUM")
                .score(55)
                .reason("Moderate symptom duration")
                .build();

        savedEntity = AIAnalysis.builder()
                .id(100L)
                .citizenId(1L)
                .queryText("I have fever and headache")
                .intent("SYMPTOM_QUERY")
                .disease("VIRAL_FEVER")
                .urgency("MEDIUM")
                .confidence(0.92)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("analyzeChat - Successful Pipeline Execution & Persistence")
    void testAnalyzeChat_Success() {
        when(healthAIClient.predictIntent(any(IntentRequestDTO.class))).thenReturn(intentDTO);
        when(healthAIClient.predictDisease(any(DiseaseRequestDTO.class))).thenReturn(diseaseDTO);
        when(healthAIClient.predictUrgency(any(UrgencyRequestDTO.class))).thenReturn(urgencyDTO);
        when(aiAnalysisRepository.save(any(AIAnalysis.class))).thenReturn(savedEntity);

        ChatAnalysisResponseDTO response = chatPipelineService.analyzeChat(requestDTO);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(1L, response.getCitizenId());
        assertEquals("I have fever and headache", response.getQuery());
        assertEquals("SYMPTOM_QUERY", response.getIntent());
        assertEquals("VIRAL_FEVER", response.getDisease());
        assertEquals("MEDIUM", response.getUrgency());
        assertEquals(0.92, response.getConfidence());
        assertNotNull(response.getTimestamp());

        verify(healthAIClient, times(1)).predictIntent(any(IntentRequestDTO.class));
        verify(healthAIClient, times(1)).predictDisease(any(DiseaseRequestDTO.class));
        verify(healthAIClient, times(1)).predictUrgency(any(UrgencyRequestDTO.class));
        verify(aiAnalysisRepository, times(1)).save(any(AIAnalysis.class));
    }

    @Test
    @DisplayName("analyzeChat - Throws AIServiceUnavailableException when Intent fails")
    void testAnalyzeChat_IntentFailure() {
        when(healthAIClient.predictIntent(any(IntentRequestDTO.class)))
                .thenThrow(new AIServiceUnavailableException("Health AI Service is unavailable."));

        AIServiceUnavailableException ex = assertThrows(
                AIServiceUnavailableException.class,
                () -> chatPipelineService.analyzeChat(requestDTO)
        );

        assertTrue(ex.getMessage().contains("unavailable"));
        verify(aiAnalysisRepository, never()).save(any());
    }

    @Test
    @DisplayName("analyzeChat - Throws AIServiceUnavailableException when Disease fails")
    void testAnalyzeChat_DiseaseFailure() {
        when(healthAIClient.predictIntent(any(IntentRequestDTO.class))).thenReturn(intentDTO);
        when(healthAIClient.predictDisease(any(DiseaseRequestDTO.class)))
                .thenThrow(new AIServiceUnavailableException("Health AI Service is unavailable."));

        AIServiceUnavailableException ex = assertThrows(
                AIServiceUnavailableException.class,
                () -> chatPipelineService.analyzeChat(requestDTO)
        );

        assertTrue(ex.getMessage().contains("unavailable"));
        verify(aiAnalysisRepository, never()).save(any());
    }

    @Test
    @DisplayName("getHistoryByCitizenId - Success")
    void testGetHistoryByCitizenId_Success() {
        when(aiAnalysisRepository.findByCitizenIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(savedEntity));

        List<ChatAnalysisResponseDTO> history = chatPipelineService.getHistoryByCitizenId(1L);

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("VIRAL_FEVER", history.get(0).getDisease());
        verify(aiAnalysisRepository, times(1)).findByCitizenIdOrderByCreatedAtDesc(1L);
    }
}
