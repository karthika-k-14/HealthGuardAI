package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.PHCRequest;
import com.healthguard.community.dto.PHCResponse;
import com.healthguard.community.dto.UpdatePHCRequest;
import com.healthguard.community.service.PHCService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/phc")
@RequiredArgsConstructor
public class PHCController {

    private final PHCService phcService;

    @PostMapping
    public ResponseEntity<ApiResponse<PHCResponse>> createPHC(@Valid @RequestBody PHCRequest request) {
        PHCResponse response = phcService.createPHC(request);
        return new ResponseEntity<>(
                ApiResponse.success("Primary Health Centre created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PHCResponse>>> getAllPHCs(
            @RequestParam(required = false) String district) {
        List<PHCResponse> response = phcService.getAllPHCs(district);
        return ResponseEntity.ok(ApiResponse.success("Primary Health Centres retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PHCResponse>> getPHCById(@PathVariable Long id) {
        PHCResponse response = phcService.getPHCById(id);
        return ResponseEntity.ok(ApiResponse.success("Primary Health Centre retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PHCResponse>> updatePHC(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePHCRequest request) {
        PHCResponse response = phcService.updatePHC(id, request);
        return ResponseEntity.ok(ApiResponse.success("Primary Health Centre updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePHC(@PathVariable Long id) {
        phcService.deletePHC(id);
        return ResponseEntity.ok(ApiResponse.success("Primary Health Centre deleted successfully"));
    }
}
