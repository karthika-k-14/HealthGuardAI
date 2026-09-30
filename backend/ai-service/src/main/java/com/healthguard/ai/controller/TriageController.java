package com.healthguard.ai.controller;

import com.healthguard.ai.dto.ApiResponse;
import com.healthguard.ai.dto.TriageRequest;
import com.healthguard.ai.dto.TriageResponse;
import com.healthguard.ai.service.TriageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/triage")
@RequiredArgsConstructor
public class TriageController {

    private final TriageService triageService;

    @PostMapping
    public ResponseEntity<ApiResponse<TriageResponse>> evaluateTriage(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @Valid @RequestBody TriageRequest request) {
        if (headerUserId != null && !headerUserId.isBlank()) {
            request.setUserId(Long.valueOf(headerUserId));
        }
        TriageResponse response = triageService.evaluateTriage(request);
        return new ResponseEntity<>(
                ApiResponse.success("Healthcare triage assessment completed successfully", response),
                HttpStatus.OK
        );
    }

    @GetMapping("/session/{sessionUuid}")
    public ResponseEntity<ApiResponse<TriageResponse>> getSessionByUuid(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable String sessionUuid,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        
        Long effectiveRequester = (headerUserId != null && !headerUserId.isBlank()) ? Long.valueOf(headerUserId) : requesterUserId;

        TriageResponse response = triageService.getSessionByUuid(sessionUuid, effectiveRequester);
        return ResponseEntity.ok(ApiResponse.success("Triage session retrieved successfully", response));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<Page<TriageResponse>>> getTriageHistory(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable Long userId,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        
        Long effectiveRequester = (headerUserId != null && !headerUserId.isBlank()) ? Long.valueOf(headerUserId) : requesterUserId;

        if (effectiveRequester != null && !effectiveRequester.equals(userId)) {
            throw new AccessDeniedException("Unauthorized: You do not have permission to view another user's triage history");
        }
        Page<TriageResponse> response = triageService.getTriageHistoryByUserId(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Triage history retrieved successfully", response));
    }

    @GetMapping("/emergency")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<TriageResponse>>> getEmergencyAlertSessions(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<TriageResponse> pageResult = triageService.getEmergencyAlertSessions(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Emergency alert triage sessions retrieved", pageResult));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<TriageResponse>>> searchSessions(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Page<TriageResponse> pageResult = triageService.searchSessions(keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Triage sessions search completed", pageResult));
    }

    @DeleteMapping("/{sessionUuid}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @PathVariable String sessionUuid,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        
        Long effectiveRequester = (headerUserId != null && !headerUserId.isBlank()) ? Long.valueOf(headerUserId) : requesterUserId;

        triageService.deleteSession(sessionUuid, effectiveRequester);
        return ResponseEntity.ok(ApiResponse.success("Triage session deleted successfully", null));
    }
}

