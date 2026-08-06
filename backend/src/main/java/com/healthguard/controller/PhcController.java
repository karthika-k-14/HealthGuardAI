package com.healthguard.controller;

import com.healthguard.dto.PhcRequest;
import com.healthguard.dto.PhcResponse;
import com.healthguard.service.PhcService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Admin-only PHC CRUD endpoints. Covered by the existing "/admin/**" ->
 * ROLE_ADMIN matcher in {@code SecurityConfig}, so no security
 * configuration changes are needed for this module. Distinct from the
 * Health Officer's read-scoped "/officer/phcs/**" endpoints.
 */
@RestController
@RequestMapping("/admin/phcs")
@RequiredArgsConstructor
@Tag(name = "Primary Health Centres", description = "Admin PHC management endpoints")
public class PhcController {

    private final PhcService phcService;

    @GetMapping
    @Operation(summary = "List all PHCs", description = "Returns a list of all Primary Health Centres.")
    public ResponseEntity<List<PhcResponse>> getAllPhcs() {
        return ResponseEntity.ok(phcService.getAllPhcs());
    }

    @GetMapping("/{phcId}")
    @Operation(summary = "Get PHC by ID", description = "Returns details for a single Primary Health Centre.")
    public ResponseEntity<PhcResponse> getPhcById(@PathVariable Long phcId) {
        return ResponseEntity.ok(phcService.getPhcById(phcId));
    }

    @PostMapping
    @Operation(summary = "Create a PHC", description = "Registers a new Primary Health Centre.")
    public ResponseEntity<PhcResponse> createPhc(@Valid @RequestBody PhcRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(phcService.createPhc(request));
    }

    @PutMapping("/{phcId}")
    @Operation(summary = "Update a PHC", description = "Updates details of an existing Primary Health Centre.")
    public ResponseEntity<PhcResponse> updatePhc(@PathVariable Long phcId,
                                                  @Valid @RequestBody PhcRequest request) {
        return ResponseEntity.ok(phcService.updatePhc(phcId, request));
    }

    @DeleteMapping("/{phcId}")
    @Operation(summary = "Delete a PHC", description = "Deletes a Primary Health Centre by ID.")
    public ResponseEntity<Void> deletePhc(@PathVariable Long phcId) {
        phcService.deletePhc(phcId);
        return ResponseEntity.noContent().build();
    }
}

