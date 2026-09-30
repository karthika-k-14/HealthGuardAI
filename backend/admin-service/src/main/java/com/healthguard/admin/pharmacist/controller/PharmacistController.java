package com.healthguard.admin.pharmacist.controller;

import com.healthguard.admin.pharmacist.dto.PharmacistRequest;
import com.healthguard.admin.pharmacist.dto.PharmacistResponse;
import com.healthguard.admin.pharmacist.dto.UpdatePharmacistRequest;
import com.healthguard.admin.pharmacist.service.PharmacistService;
import com.healthguard.admin.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacists")
@RequiredArgsConstructor
public class PharmacistController {

    private final PharmacistService pharmacistService;

    @PostMapping
    public ResponseEntity<ApiResponse<PharmacistResponse>> createPharmacist(@Valid @RequestBody PharmacistRequest request) {
        PharmacistResponse response = pharmacistService.createPharmacist(request);
        return new ResponseEntity<>(
                ApiResponse.success("Pharmacist registered successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PharmacistResponse>>> getAllPharmacists() {
        List<PharmacistResponse> response = pharmacistService.getAllPharmacists();
        return ResponseEntity.ok(ApiResponse.success("Pharmacists list retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PharmacistResponse>> getPharmacistById(@PathVariable Long id) {
        PharmacistResponse response = pharmacistService.getPharmacistById(id);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PharmacistResponse>> updatePharmacist(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePharmacistRequest request) {
        PharmacistResponse response = pharmacistService.updatePharmacist(id, request);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePharmacist(@PathVariable Long id) {
        pharmacistService.deletePharmacist(id);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist deleted successfully"));
    }
}
