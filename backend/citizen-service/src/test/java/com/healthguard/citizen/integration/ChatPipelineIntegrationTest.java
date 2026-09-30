package com.healthguard.citizen.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguard.citizen.client.HealthAIClient;
import com.healthguard.citizen.dto.*;
import com.healthguard.citizen.entity.AIAnalysis;
import com.healthguard.citizen.repository.AIAnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ChatPipelineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AIAnalysisRepository aiAnalysisRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HealthAIClient healthAIClient;

    @BeforeEach
    void setUp() {
        aiAnalysisRepository.deleteAll();
    }

    @Test
    @DisplayName("Integration Test: Controller -> Service -> Feign Mock -> DB Persistence")
    void testChatPipeline_FullIntegration() throws Exception {
        // Arrange
        ChatAnalysisRequestDTO request = ChatAnalysisRequestDTO.builder()
                .citizenId(1L)
                .message("I have severe fever, body pain and headache")
                .language("en")
                .build();

        IntentResponseDTO intentRes = IntentResponseDTO.builder()
                .intent("symptom_query")
                .confidence(0.96)
                .build();

        DiseaseResponseDTO diseaseRes = DiseaseResponseDTO.builder()
                .diseaseCategory("viral_fever")
                .confidence(0.92)
                .build();

        UrgencyResponseDTO urgencyRes = UrgencyResponseDTO.builder()
                .urgency("MEDIUM")
                .score(60)
                .reason("Persistent fever detected")
                .build();

        when(healthAIClient.predictIntent(any(IntentRequestDTO.class))).thenReturn(intentRes);
        when(healthAIClient.predictDisease(any(DiseaseRequestDTO.class))).thenReturn(diseaseRes);
        when(healthAIClient.predictUrgency(any(UrgencyRequestDTO.class))).thenReturn(urgencyRes);

        // Act & Assert HTTP Call
        mockMvc.perform(post("/api/citizen/chat/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizenId").value(1))
                .andExpect(jsonPath("$.query").value("I have severe fever, body pain and headache"))
                .andExpect(jsonPath("$.intent").value("symptom_query"))
                .andExpect(jsonPath("$.disease").value("viral_fever"))
                .andExpect(jsonPath("$.urgency").value("MEDIUM"))
                .andExpect(jsonPath("$.confidence").value(0.92));

        // Assert Database Persistence
        List<AIAnalysis> savedRecords = aiAnalysisRepository.findByCitizenId(1L);
        assertEquals(1, savedRecords.size());
        AIAnalysis record = savedRecords.get(0);
        assertNotNull(record.getId());
        assertEquals("I have severe fever, body pain and headache", record.getQueryText());
        assertEquals("symptom_query", record.getIntent());
        assertEquals("viral_fever", record.getDisease());
        assertEquals("MEDIUM", record.getUrgency());
        assertNotNull(record.getCreatedAt());
    }

    @Test
    @DisplayName("Integration Test: Transaction Rollback on Exception")
    void testChatPipeline_TransactionRollbackOnException() throws Exception {
        ChatAnalysisRequestDTO request = ChatAnalysisRequestDTO.builder()
                .citizenId(2L)
                .message("Invalid query that breaks Feign")
                .build();

        when(healthAIClient.predictIntent(any(IntentRequestDTO.class)))
                .thenThrow(new RuntimeException("FastAPI Connection Failed"));

        mockMvc.perform(post("/api/citizen/chat/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value("ERROR"));

        // Verify Database Rollback - no records saved
        List<AIAnalysis> records = aiAnalysisRepository.findByCitizenId(2L);
        assertTrue(records.isEmpty(), "Database record must NOT be saved when pipeline execution fails");
    }
}
