package com.healthguard.service;

import com.healthguard.dto.AIChatResponse;
import com.healthguard.service.AIRouter.SourceType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Manages chat session context and response formatting for HealthGuard AI.
 */
@Slf4j
@Service
public class ConversationService {

    /**
     * Constructs standardized AIChatResponse DTO.
     */
    public AIChatResponse createResponse(String replyText, SourceType sourceType) {
        return AIChatResponse.builder()
                .reply(replyText)
                .source(sourceType != null ? sourceType.name() : SourceType.GEMINI.name())
                .build();
    }
}
