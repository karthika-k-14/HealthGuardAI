package com.healthguard.ai.controller;

import com.healthguard.ai.dto.ApiResponse;
import com.healthguard.ai.dto.ChatRequest;
import com.healthguard.ai.dto.ChatResponse;
import com.healthguard.ai.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> processChat(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody ChatRequest request) {
        
        if (headerUserId != null && !headerUserId.isBlank()) {
            request.setUserId(Long.valueOf(headerUserId));
        }

        ChatResponse response = chatService.processChat(request);
        return new ResponseEntity<>(
                ApiResponse.success("AI response generated successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getChatHistory(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long userId) {
        
        if (headerUserId != null && !headerUserId.isBlank()) {
            Long authUserId = Long.valueOf(headerUserId);
            if (!authUserId.equals(userId)) {
                return new ResponseEntity<>(ApiResponse.error("Access denied"), HttpStatus.FORBIDDEN);
            }
        }

        List<ChatResponse> response = chatService.getChatHistoryByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved successfully", response));
    }
}
