package com.healthguard.controller;

import com.healthguard.dto.HealthResponse;
import com.healthguard.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes a simple health check endpoint used by the frontend
 * to verify frontend-backend connectivity.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Health Check", description = "System health check endpoint")
public class HealthController {

    private final HealthService healthService;

    @GetMapping("/health")
    @Operation(summary = "Get system health status", description = "Returns system operational health status, version, and timestamp.")
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(healthService.getHealthStatus());
    }
}

