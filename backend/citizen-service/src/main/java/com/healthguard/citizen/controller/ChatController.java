package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.dto.ChatClassifyDTOs.*;
import com.healthguard.citizen.service.ClinicalChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping({"/api/chat", "/api/citizen/chat"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final ClinicalChatService clinicalChatService;

    /**
     * Requirement: POST /api/chat/classify
     * Analyzes query, extracts symptoms, classifies disease category & urgency level,
     * stores in ai_analysis, and auto-escalates if HIGH or CRITICAL.
     */
    @PostMapping("/classify")
    public ResponseEntity<ApiResponse<ClassifyResponse>> classifyQuery(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody ClassifyRequest request) {
        if (request.getCitizenId() == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                request.setCitizenId(Long.parseLong(headerUserId));
            } catch (Exception ignored) {}
        }
        ClassifyResponse response = clinicalChatService.classifyQuery(request);
        return ResponseEntity.ok(ApiResponse.success("Query classified successfully", response));
    }

    /**
     * Requirement: POST /api/chat/consult
     * Clinical multi-turn health consultant (symptoms, awareness, prevention, facilities)
     */
    @PostMapping("/consult")
    public ResponseEntity<ApiResponse<ConsultResponse>> consultChat(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestBody ConsultRequest request) {
        if (request.getCitizenId() == null && headerUserId != null && !headerUserId.isBlank()) {
            try {
                request.setCitizenId(Long.parseLong(headerUserId));
            } catch (Exception ignored) {}
        }
        ConsultResponse response = clinicalChatService.consultChat(request);
        return ResponseEntity.ok(ApiResponse.success("Consultation response generated successfully", response));
    }
}
