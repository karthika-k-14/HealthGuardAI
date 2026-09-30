package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.dto.DiseaseAwarenessResponseDTO;
import com.healthguard.citizen.dto.DiseaseSuggestionDTO;
import com.healthguard.citizen.service.DiseaseAwarenessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/awareness", "/api/citizen/awareness"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DiseaseAwarenessController {

    private final DiseaseAwarenessService diseaseAwarenessService;

    /**
     * Requirement 7: GET /api/awareness/search?q=dengue&language=tamil
     * Search disease awareness content, symptoms, prevention, government recommendations, and real YouTube videos.
     */
    @GetMapping("/search")
    public ResponseEntity<DiseaseAwarenessResponseDTO> searchAwareness(
            @RequestParam(value = "q", required = false, defaultValue = "") String query,
            @RequestParam(value = "language", required = false, defaultValue = "english") String language
    ) {
        log.info("Received disease awareness search request: q='{}', language='{}'", query, language);
        DiseaseAwarenessResponseDTO response = diseaseAwarenessService.searchAwareness(query, language);
        return ResponseEntity.ok(response);
    }

    /**
     * Requirement 5: Suggestions while typing (den -> Dengue, mal -> Malaria, etc.)
     */
    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<DiseaseSuggestionDTO>>> getSuggestions(
            @RequestParam(value = "q", required = false, defaultValue = "") String prefix,
            @RequestParam(value = "language", required = false, defaultValue = "english") String language
    ) {
        List<DiseaseSuggestionDTO> suggestions = diseaseAwarenessService.getSuggestions(prefix, language);
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved successfully", suggestions));
    }

    /**
     * Requirement 9: Show trending diseases when search is empty
     */
    @GetMapping("/trending")
    public ResponseEntity<DiseaseAwarenessResponseDTO> getTrending(
            @RequestParam(value = "language", required = false, defaultValue = "english") String language
    ) {
        DiseaseAwarenessResponseDTO response = diseaseAwarenessService.getTrendingDiseaseAwareness(language);
        return ResponseEntity.ok(response);
    }
}
