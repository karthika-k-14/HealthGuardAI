package com.healthguard.controller;

import com.healthguard.dto.SchemeRequest;
import com.healthguard.dto.SchemeResponse;
import com.healthguard.service.SchemeService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Government Scheme CRUD endpoints.
 * <p>
 * Reads ({@code /schemes/**}) are not under "/admin/**", "/citizen/**",
 * etc. so they fall to the "anyRequest().authenticated()" rule in
 * {@code SecurityConfig} - reachable by any authenticated role (Citizens
 * browsing schemes, in particular). Writes ({@code /admin/schemes/**})
 * are covered by the existing "/admin/**" -> ROLE_ADMIN matcher.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Government Schemes", description = "Government scheme catalog management and search")
public class SchemeController {

    private final SchemeService schemeService;

    @GetMapping("/schemes")
    @Operation(summary = "List all government schemes", description = "Returns every government health scheme.")
    public ResponseEntity<List<SchemeResponse>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/schemes/search")
    @Operation(summary = "Search government schemes", description = "Search schemes by title/description query and category.")
    public ResponseEntity<List<SchemeResponse>> searchSchemes(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(schemeService.searchSchemes(query, category));
    }

    @GetMapping("/schemes/{schemeId}")
    @Operation(summary = "Get government scheme by ID", description = "Returns details for a single government scheme.")
    public ResponseEntity<SchemeResponse> getSchemeById(@PathVariable Long schemeId) {
        return ResponseEntity.ok(schemeService.getSchemeById(schemeId));
    }

    @PostMapping("/admin/schemes")
    @Operation(summary = "Create a government scheme", description = "Creates a new government health scheme (Admin only).")
    public ResponseEntity<SchemeResponse> createScheme(@Valid @RequestBody SchemeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schemeService.createScheme(request));
    }

    @PutMapping("/admin/schemes/{schemeId}")
    @Operation(summary = "Update a government scheme", description = "Updates an existing government scheme (Admin only).")
    public ResponseEntity<SchemeResponse> updateScheme(@PathVariable Long schemeId,
                                                         @Valid @RequestBody SchemeRequest request) {
        return ResponseEntity.ok(schemeService.updateScheme(schemeId, request));
    }

    @DeleteMapping("/admin/schemes/{schemeId}")
    @Operation(summary = "Delete a government scheme", description = "Deletes a government scheme by ID (Admin only).")
    public ResponseEntity<Void> deleteScheme(@PathVariable Long schemeId) {
        schemeService.deleteScheme(schemeId);
        return ResponseEntity.noContent().build();
    }
}

