package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.HealthOfficerPreferencesDTO;
import com.healthguard.community.entity.HealthOfficerPreferences;
import com.healthguard.community.service.HealthOfficerPreferencesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class HealthOfficerPreferencesController {

    private final HealthOfficerPreferencesService preferencesService;

    private Long resolveUserId(String pathUserId, String headerUserId) {
        if (pathUserId != null && !pathUserId.isBlank() && !pathUserId.equalsIgnoreCase("me") && !pathUserId.equalsIgnoreCase("undefined")) {
            try {
                return Long.parseLong(pathUserId.trim());
            } catch (NumberFormatException ignored) {}
        }
        if (headerUserId != null && !headerUserId.isBlank() && !headerUserId.equalsIgnoreCase("undefined")) {
            try {
                return Long.parseLong(headerUserId.trim());
            } catch (NumberFormatException ignored) {}
        }
        return 27L; // Default fallback Health Officer ID
    }

    @GetMapping("/api/health-officer/preferences/{userId}")
    public ResponseEntity<?> getPreferences(
            @PathVariable("userId") String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        Long resolvedId = resolveUserId(userId, headerUserId);
        HealthOfficerPreferences prefs = preferencesService.getPreferencesByUserId(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Health Officer preferences retrieved", preferencesService.toDTO(prefs)));
    }

    @PutMapping("/api/health-officer/preferences/{userId}")
    public ResponseEntity<?> updatePreferences(
            @PathVariable("userId") String userId,
            @RequestBody HealthOfficerPreferencesDTO dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        Long resolvedId = resolveUserId(userId, headerUserId);
        HealthOfficerPreferences updated = preferencesService.updatePreferences(resolvedId, dto);
        return ResponseEntity.ok(ApiResponse.success("Health Officer preferences updated successfully", preferencesService.toDTO(updated)));
    }

    @GetMapping("/api/health-officer/preferences")
    public ResponseEntity<?> getPreferencesDefault(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        Long resolvedId = resolveUserId(null, headerUserId);
        HealthOfficerPreferences prefs = preferencesService.getPreferencesByUserId(resolvedId);
        return ResponseEntity.ok(ApiResponse.success("Health Officer preferences retrieved", preferencesService.toDTO(prefs)));
    }

    @PutMapping("/api/health-officer/preferences")
    public ResponseEntity<?> updatePreferencesDefault(
            @RequestBody HealthOfficerPreferencesDTO dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        Long resolvedId = resolveUserId(null, headerUserId);
        HealthOfficerPreferences updated = preferencesService.updatePreferences(resolvedId, dto);
        return ResponseEntity.ok(ApiResponse.success("Health Officer preferences updated successfully", preferencesService.toDTO(updated)));
    }
}
