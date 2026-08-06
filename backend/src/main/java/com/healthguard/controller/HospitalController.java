package com.healthguard.controller;

import com.healthguard.dto.HospitalRequest;
import com.healthguard.dto.HospitalResponse;
import com.healthguard.service.HospitalService;
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
 * Admin-only Hospital CRUD endpoints. Covered by the existing
 * "/admin/**" -> ROLE_ADMIN matcher in {@code SecurityConfig}, so no
 * security configuration changes are needed for this module.
 */
@RestController
@RequestMapping("/admin/hospitals")
@RequiredArgsConstructor
@Tag(name = "Hospitals", description = "Admin hospital management endpoints")
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    @Operation(summary = "List all hospitals", description = "Returns a list of all registered hospitals.")
    public ResponseEntity<List<HospitalResponse>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/{hospitalId}")
    @Operation(summary = "Get hospital by ID", description = "Returns details for a single hospital.")
    public ResponseEntity<HospitalResponse> getHospitalById(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(hospitalService.getHospitalById(hospitalId));
    }

    @PostMapping
    @Operation(summary = "Create a hospital", description = "Registers a new hospital facility.")
    public ResponseEntity<HospitalResponse> createHospital(@Valid @RequestBody HospitalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalService.createHospital(request));
    }

    @PutMapping("/{hospitalId}")
    @Operation(summary = "Update a hospital", description = "Updates details of an existing hospital.")
    public ResponseEntity<HospitalResponse> updateHospital(@PathVariable Long hospitalId,
                                                             @Valid @RequestBody HospitalRequest request) {
        return ResponseEntity.ok(hospitalService.updateHospital(hospitalId, request));
    }

    @DeleteMapping("/{hospitalId}")
    @Operation(summary = "Delete a hospital", description = "Deletes a hospital record by ID.")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long hospitalId) {
        hospitalService.deleteHospital(hospitalId);
        return ResponseEntity.noContent().build();
    }
}

