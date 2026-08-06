package com.healthguard.controller;

import com.healthguard.dto.AIChatRequest;
import com.healthguard.dto.AIChatResponse;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Intelligent AI Chatbot Controller.
 * Endpoint: POST /ai/chat
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Chatbot", description = "Intelligent AI Chatbot endpoint combining Database records and Gemini AI")
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Chat with HealthGuard AI Assistant", description = "Intelligently routes queries between PostgreSQL database records, Google Gemini AI, or Hybrid reasoning based on query intent.")
    public ResponseEntity<AIChatResponse> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AIChatRequest request
    ) {
        AIChatResponse response = aiService.processChat(principal.getUser(), request);
        return ResponseEntity.ok(response);
    }
}
