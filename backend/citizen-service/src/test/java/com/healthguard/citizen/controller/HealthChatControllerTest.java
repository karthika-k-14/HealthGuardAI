package com.healthguard.citizen.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguard.citizen.dto.ChatAnalysisRequestDTO;
import com.healthguard.citizen.dto.ChatAnalysisResponseDTO;
import com.healthguard.citizen.exception.AIServiceUnavailableException;
import com.healthguard.citizen.exception.GlobalExceptionHandler;
import com.healthguard.citizen.service.ChatPipelineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class HealthChatControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ChatPipelineService chatPipelineService;

    @InjectMocks
    private HealthChatController healthChatController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(healthChatController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/citizen/chat/analyze - Success 200 OK")
    void testAnalyzeQuery_Success() throws Exception {
        ChatAnalysisRequestDTO request = ChatAnalysisRequestDTO.builder()
                .citizenId(1L)
                .message("I have fever and headache")
                .build();

        ChatAnalysisResponseDTO response = ChatAnalysisResponseDTO.builder()
                .id(101L)
                .citizenId(1L)
                .query("I have fever and headache")
                .intent("symptom_query")
                .disease("viral_fever")
                .urgency("MEDIUM")
                .confidence(0.92)
                .timestamp(LocalDateTime.of(2026, 8, 17, 12, 0, 0))
                .build();

        when(chatPipelineService.analyzeChat(any(ChatAnalysisRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/citizen/chat/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.citizenId").value(1))
                .andExpect(jsonPath("$.query").value("I have fever and headache"))
                .andExpect(jsonPath("$.intent").value("symptom_query"))
                .andExpect(jsonPath("$.disease").value("viral_fever"))
                .andExpect(jsonPath("$.urgency").value("MEDIUM"))
                .andExpect(jsonPath("$.confidence").value(0.92))
                .andExpect(jsonPath("$.timestamp").value("2026-08-17T12:00:00"));

        verify(chatPipelineService, times(1)).analyzeChat(any(ChatAnalysisRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/citizen/chat/analyze - Validation Failure 400 Bad Request")
    void testAnalyzeQuery_ValidationError() throws Exception {
        ChatAnalysisRequestDTO invalidRequest = ChatAnalysisRequestDTO.builder()
                .citizenId(null)
                .message("")
                .build();

        mockMvc.perform(post("/api/citizen/chat/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("VALIDATION_ERROR"));

        verify(chatPipelineService, never()).analyzeChat(any());
    }

    @Test
    @DisplayName("POST /api/citizen/chat/analyze - AI Service Down 503 Service Unavailable")
    void testAnalyzeQuery_AIServiceUnavailable() throws Exception {
        ChatAnalysisRequestDTO request = ChatAnalysisRequestDTO.builder()
                .citizenId(1L)
                .message("I have fever and headache")
                .build();

        when(chatPipelineService.analyzeChat(any(ChatAnalysisRequestDTO.class)))
                .thenThrow(new AIServiceUnavailableException("Health AI Service is unavailable."));

        mockMvc.perform(post("/api/citizen/chat/analyze")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("AI_SERVICE_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("Health AI Service is unavailable."));
    }

    @Test
    @DisplayName("GET /api/citizen/chat/history/{citizenId} - Success 200 OK")
    void testGetHistory_Success() throws Exception {
        ChatAnalysisResponseDTO response = ChatAnalysisResponseDTO.builder()
                .id(101L)
                .citizenId(1L)
                .query("I have fever and headache")
                .intent("symptom_query")
                .disease("viral_fever")
                .urgency("MEDIUM")
                .confidence(0.92)
                .timestamp(LocalDateTime.of(2026, 8, 17, 12, 0, 0))
                .build();

        when(chatPipelineService.getHistoryByCitizenId(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/citizen/chat/history/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].citizenId").value(1))
                .andExpect(jsonPath("$[0].disease").value("viral_fever"));

        verify(chatPipelineService, times(1)).getHistoryByCitizenId(1L);
    }
}
