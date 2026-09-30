package com.healthguard.ai;

import com.healthguard.ai.dto.ChatRequest;
import com.healthguard.ai.dto.ChatResponse;
import com.healthguard.ai.dto.SymptomRequest;
import com.healthguard.ai.dto.SymptomResponse;
import com.healthguard.ai.service.ChatService;
import com.healthguard.ai.service.SymptomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AiServiceApplicationTests {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SymptomService symptomService;

    private ChatRequest chatRequest;
    private SymptomRequest symptomRequest;

    @BeforeEach
    void setUp() {
        chatRequest = ChatRequest.builder()
                .userId(101L)
                .question("What should I do if I have a mild fever?")
                .build();

        symptomRequest = SymptomRequest.builder()
                .userId(101L)
                .symptoms("High fever and persistent cough")
                .build();
    }

    @Test
    void contextLoads() {
        assertNotNull(chatService);
        assertNotNull(symptomService);
    }

    @Test
    @DisplayName("Process Chat - Success")
    void testProcessChatSuccess() {
        ChatResponse response = chatService.processChat(chatRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(101L, response.getUserId());
        assertEquals("What should I do if I have a mild fever?", response.getQuestion());
        assertNotNull(response.getResponse());
        assertTrue(response.getResponse().contains("fever"));
    }

    @Test
    @DisplayName("Get Chat History - Success")
    void testGetChatHistorySuccess() {
        chatService.processChat(chatRequest);

        List<ChatResponse> history = chatService.getChatHistoryByUserId(101L);

        assertFalse(history.isEmpty());
        assertEquals(1, history.size());
        assertEquals("What should I do if I have a mild fever?", history.get(0).getQuestion());
    }

    @Test
    @DisplayName("Assess Symptoms - Success")
    void testAssessSymptomsSuccess() {
        SymptomResponse response = symptomService.assessSymptoms(symptomRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(101L, response.getUserId());
        assertEquals("High fever and persistent cough", response.getSymptoms());
        assertNotNull(response.getPrediction());
        assertNotNull(response.getRiskLevel());
        assertNotNull(response.getRecommendation());
    }

    @Test
    @DisplayName("Get Symptom Assessment History - Success")
    void testGetSymptomHistorySuccess() {
        symptomService.assessSymptoms(symptomRequest);

        List<SymptomResponse> history = symptomService.getSymptomHistoryByUserId(101L);

        assertFalse(history.isEmpty());
        assertEquals(1, history.size());
        assertEquals("High fever and persistent cough", history.get(0).getSymptoms());
    }
}
