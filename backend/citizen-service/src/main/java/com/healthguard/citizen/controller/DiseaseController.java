package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.dto.DiseaseAwarenessResponseDTO;
import com.healthguard.citizen.dto.DiseaseSuggestionDTO;
import com.healthguard.citizen.entity.DiseaseSearchHistory;
import com.healthguard.citizen.repository.DiseaseSearchHistoryRepository;
import com.healthguard.citizen.service.DiseaseAwarenessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/diseases", "/api/awareness"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseAwarenessService diseaseAwarenessService;
    private final DiseaseSearchHistoryRepository searchHistoryRepository;

    /**
     * Requirement: GET /api/diseases/search?q=dengue&language=english
     * Search disease awareness content, symptoms, prevention, warning signs,
     * and real YouTube videos specific to searched disease.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<DiseaseAwarenessResponseDTO>> searchDiseases(
            @RequestParam(value = "q", required = false, defaultValue = "") String query,
            @RequestParam(value = "language", required = false, defaultValue = "english") String language,
            @RequestParam(value = "citizenId", required = false) Long citizenId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        log.info("Disease search requested: q='{}', language='{}'", query, language);
        DiseaseAwarenessResponseDTO response = diseaseAwarenessService.searchAwareness(query, language);

        // Record search history if citizen is identified
        Long targetCitizenId = citizenId;
        if (targetCitizenId == null && headerUserId != null && !headerUserId.isBlank()) {
            try { targetCitizenId = Long.parseLong(headerUserId); } catch (Exception ignored) {}
        }
        if (targetCitizenId != null && query != null && !query.trim().isBlank()) {
            try {
                searchHistoryRepository.save(DiseaseSearchHistory.builder()
                        .citizenId(targetCitizenId)
                        .diseaseName(response.getDiseaseName() != null ? response.getDiseaseName() : query.trim())
                        .build());
            } catch (Exception e) {
                log.warn("Could not save disease search history: {}", e.getMessage());
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Disease information retrieved successfully", response));
    }

    /**
     * Requirement: GET /api/diseases/history
     * Returns Recently Viewed Diseases and Top Searched Diseases from PostgreSQL.
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSearchHistory(
            @RequestParam(value = "citizenId", required = false) Long citizenId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {

        Long targetCitizenId = citizenId;
        if (targetCitizenId == null && headerUserId != null && !headerUserId.isBlank()) {
            try { targetCitizenId = Long.parseLong(headerUserId); } catch (Exception ignored) {}
        }
        if (targetCitizenId == null) {
            targetCitizenId = 1L; // Default citizen ID
        }

        // Recent searches for this citizen
        List<String> recentSearches = searchHistoryRepository.findDistinctRecentSearchesByCitizenId(
                targetCitizenId, PageRequest.of(0, 8)
        );

        // Top searched overall
        List<Object[]> topData = searchHistoryRepository.findTopSearchedDiseases(PageRequest.of(0, 8));
        List<Map<String, Object>> topSearched = topData.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("diseaseName", row[0]);
            item.put("count", row[1]);
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("recentSearches", recentSearches);
        result.put("topSearched", topSearched);

        return ResponseEntity.ok(ApiResponse.success("Disease search history retrieved", result));
    }

    /**
     * POST /api/diseases/history
     * Manually record disease search view.
     */
    @PostMapping("/history")
    public ResponseEntity<ApiResponse<Void>> recordSearchHistory(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        Long citizenId = null;
        if (body.get("citizenId") != null) {
            citizenId = ((Number) body.get("citizenId")).longValue();
        } else if (headerUserId != null && !headerUserId.isBlank()) {
            try { citizenId = Long.parseLong(headerUserId); } catch (Exception ignored) {}
        }
        String diseaseName = (String) body.get("diseaseName");
        if (citizenId != null && diseaseName != null && !diseaseName.isBlank()) {
            searchHistoryRepository.save(DiseaseSearchHistory.builder()
                    .citizenId(citizenId)
                    .diseaseName(diseaseName)
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.success("Search history recorded", null));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<ApiResponse<List<DiseaseSuggestionDTO>>> getSuggestions(
            @RequestParam(value = "q", required = false, defaultValue = "") String prefix,
            @RequestParam(value = "language", required = false, defaultValue = "english") String language) {
        List<DiseaseSuggestionDTO> suggestions = diseaseAwarenessService.getSuggestions(prefix, language);
        return ResponseEntity.ok(ApiResponse.success("Suggestions retrieved successfully", suggestions));
    }
}
