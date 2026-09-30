package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ChatAnalysisRequestDTO;
import com.healthguard.citizen.dto.ChatAnalysisResponseDTO;
import com.healthguard.citizen.service.ChatPipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizen/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Citizen Health Chat AI", description = "Endpoints for processing citizen health queries via Python FastAPI integration")
public class HealthChatController {

    private final ChatPipelineService chatPipelineService;

    @PostMapping("/analyze")
    @Operation(
        summary = "Analyze Citizen Health Query",
        description = "Orchestrates Intent Detection, Disease Classification, and Urgency Scoring via FastAPI health-ai-service and persists results in PostgreSQL database."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "AI Analysis successfully completed and saved",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ChatAnalysisResponseDTO.class),
                examples = @ExampleObject(value = "{\n  \"id\": 101,\n  \"citizenId\": 1,\n  \"query\": \"I have fever and headache\",\n  \"intent\": \"symptom_query\",\n  \"disease\": \"viral_fever\",\n  \"urgency\": \"MEDIUM\",\n  \"confidence\": 0.92,\n  \"timestamp\": \"2026-08-17T12:00:00\"\n}")
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid query request payload",
            content = @Content(mediaType = "application/json")
        ),
        @ApiResponse(
            responseCode = "503",
            description = "FastAPI Health AI Service unavailable",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = "{\n  \"status\": \"AI_SERVICE_UNAVAILABLE\",\n  \"message\": \"Health AI Service is unavailable.\",\n  \"timestamp\": \"2026-08-17T23:20:00\"\n}")
            )
        )
    })
    public ResponseEntity<ChatAnalysisResponseDTO> analyzeQuery(
            @Valid @RequestBody ChatAnalysisRequestDTO request) {
        log.info("Received POST /api/citizen/chat/analyze request for Citizen ID: {}", request.getCitizenId());
        ChatAnalysisResponseDTO response = chatPipelineService.analyzeChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{citizenId}")
    @Operation(
        summary = "Get Citizen AI Query History",
        description = "Retrieves all historical AI health query analysis records for a specified citizen ID from PostgreSQL."
    )
    public ResponseEntity<List<ChatAnalysisResponseDTO>> getHistory(@PathVariable Long citizenId) {
        log.info("Received GET /api/citizen/chat/history/{} request", citizenId);
        List<ChatAnalysisResponseDTO> history = chatPipelineService.getHistoryByCitizenId(citizenId);
        return ResponseEntity.ok(history);
    }
}
