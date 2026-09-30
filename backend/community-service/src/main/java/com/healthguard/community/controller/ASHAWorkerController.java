package com.healthguard.community.controller;

import com.healthguard.community.dto.ApiResponse;
import com.healthguard.community.dto.ASHAWorkerRequest;
import com.healthguard.community.dto.ASHAWorkerResponse;
import com.healthguard.community.dto.UpdateASHAWorkerRequest;
import com.healthguard.community.service.ASHAWorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asha")
@RequiredArgsConstructor
public class ASHAWorkerController {

    private final ASHAWorkerService ashaWorkerService;

    @PostMapping
    public ResponseEntity<ApiResponse<ASHAWorkerResponse>> createWorker(@Valid @RequestBody ASHAWorkerRequest request) {
        ASHAWorkerResponse response = ashaWorkerService.createWorker(request);
        return new ResponseEntity<>(
                ApiResponse.success("ASHA Worker created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<ASHAWorkerResponse>> getWorkerById(@PathVariable Long id) {
        ASHAWorkerResponse response = ashaWorkerService.getWorkerById(id);
        return ResponseEntity.ok(ApiResponse.success("ASHA Worker retrieved successfully", response));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<ASHAWorkerResponse>> updateWorker(
            @PathVariable Long id,
            @Valid @RequestBody UpdateASHAWorkerRequest request) {
        ASHAWorkerResponse response = ashaWorkerService.updateWorker(id, request);
        return ResponseEntity.ok(ApiResponse.success("ASHA Worker updated successfully", response));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<ApiResponse<Void>> deleteWorker(@PathVariable Long id) {
        ashaWorkerService.deleteWorker(id);
        return ResponseEntity.ok(ApiResponse.success("ASHA Worker deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ASHAWorkerResponse>>> getAllWorkers(
            @RequestParam(required = false) String district) {
        List<ASHAWorkerResponse> response = ashaWorkerService.getAllWorkers(district);
        return ResponseEntity.ok(ApiResponse.success("ASHA Workers retrieved successfully", response));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTodayTasks() {
        return ResponseEntity.ok(ApiResponse.success("Today's tasks retrieved successfully", List.of()));
    }
}
