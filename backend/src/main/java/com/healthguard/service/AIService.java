package com.healthguard.service;

import com.healthguard.dto.AIChatRequest;
import com.healthguard.dto.AIChatResponse;
import com.healthguard.entity.User;
import com.healthguard.service.AIRouter.SourceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Main AI Chat Orchestrator Service.
 * Combines AIRouter, DatabaseQueryService, GeminiService, PromptBuilder, and ConversationService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final AIRouter aiRouter;
    private final DatabaseQueryService databaseQueryService;
    private final GeminiService geminiService;
    private final PromptBuilder promptBuilder;
    private final ConversationService conversationService;

    /**
     * Processes an incoming chat message for an authenticated user.
     *
     * @param user    Currently logged-in User
     * @param request Chat payload containing user message
     * @return AIChatResponse containing reply string and source (DATABASE | GEMINI | HYBRID)
     */
    public AIChatResponse processChat(User user, AIChatRequest request) {
        String message = request.getMessage();
        long startTime = System.currentTimeMillis();

        SourceType sourceType = aiRouter.route(message);
        log.info("Processing AI Chat Request for user ID {}. Message: '{}', Classified Route: {}",
                user != null ? user.getId() : "GUEST", message, sourceType);

        String replyText;

        switch (sourceType) {
            case DATABASE:
                log.info("Executing DATABASE route for query: '{}'", message);
                replyText = databaseQueryService.executeQuery(user, message);
                break;

            case HYBRID:
                log.info("Executing HYBRID route for query: '{}'", message);
                String dbDataSummary = databaseQueryService.executeQuery(user, message);
                String hybridPrompt = promptBuilder.buildHybridPrompt(user, message, dbDataSummary);
                replyText = geminiService.generateContent(hybridPrompt);
                break;

            case GEMINI:
            default:
                log.info("Executing GEMINI route for query: '{}'", message);
                String generalPrompt = promptBuilder.buildGeneralPrompt(message);
                replyText = geminiService.generateContent(generalPrompt);
                break;
        }

        long elapsed = System.currentTimeMillis() - startTime;
        log.info("Completed AI Chat Request in {} ms. Source: {}", elapsed, sourceType);

        return conversationService.createResponse(replyText, sourceType);
    }
}
