package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.ApiResponse;
import com.healthguard.citizen.dto.GovernmentSchemeDTO;
import com.healthguard.citizen.service.GovernmentSchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/citizen/schemes", "/api/citizens/schemes", "/api/schemes"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GovernmentSchemeController {

    private final GovernmentSchemeService schemeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GovernmentSchemeDTO>>> getAllSchemes(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "search", required = false) String search
    ) {
        List<GovernmentSchemeDTO> schemes = schemeService.getAllSchemes(category, state, search);
        return ResponseEntity.ok(ApiResponse.success("Government schemes retrieved successfully", schemes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GovernmentSchemeDTO>> getSchemeById(@PathVariable Long id) {
        GovernmentSchemeDTO scheme = schemeService.getSchemeById(id);
        return ResponseEntity.ok(ApiResponse.success("Government scheme details retrieved successfully", scheme));
    }

    @GetMapping("/eligible/{citizenId}")
    public ResponseEntity<ApiResponse<List<GovernmentSchemeDTO>>> getEligibleSchemes(@PathVariable Long citizenId) {
        List<GovernmentSchemeDTO> schemes = schemeService.getEligibleSchemesForCitizen(citizenId);
        return ResponseEntity.ok(ApiResponse.success("Eligible government schemes retrieved successfully", schemes));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = schemeService.getCategories();
        return ResponseEntity.ok(ApiResponse.success("Scheme categories retrieved successfully", categories));
    }

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<String>>> getStates() {
        List<String> states = schemeService.getStates();
        return ResponseEntity.ok(ApiResponse.success("Scheme states retrieved successfully", states));
    }
}
