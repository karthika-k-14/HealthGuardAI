package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.HealthRecordRequest;
import com.healthguard.citizen.dto.HealthRecordResponse;
import com.healthguard.citizen.service.HealthRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizens")
@RequiredArgsConstructor
public class HealthRecordController {

    private final HealthRecordService healthRecordService;

    @GetMapping({ "/{userId:\\d+}/health-records", "/health-records" })
    public ResponseEntity<List<HealthRecordResponse>> getHealthRecords(
            @PathVariable(value = "userId", required = false) Long pathUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole
    ) {
        Long targetId = pathUserId;
        if (targetId == null && headerUserId != null && !headerUserId.isBlank()) {
            targetId = Long.valueOf(headerUserId);
        }
        if (targetId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(targetId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(healthRecordService.getHealthRecordsByUserId(targetId));
    }

    @PostMapping({ "/{userId:\\d+}/health-records", "/health-records" })
    public ResponseEntity<HealthRecordResponse> addHealthRecord(
            @PathVariable(value = "userId", required = false) Long pathUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestBody HealthRecordRequest request
    ) {
        Long targetId = pathUserId != null ? pathUserId : (request.getUserId() != null ? request.getUserId() : (headerUserId != null && !headerUserId.isBlank() ? Long.valueOf(headerUserId) : null));
        if (targetId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(targetId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return new ResponseEntity<>(healthRecordService.addHealthRecord(targetId, request), HttpStatus.CREATED);
    }

    @PutMapping("/{userId:\\d+}/health-records/{id:\\d+}")
    public ResponseEntity<HealthRecordResponse> updateHealthRecord(
            @PathVariable("userId") Long userId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestBody HealthRecordRequest request
    ) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(healthRecordService.updateHealthRecord(id, request));
    }

    @DeleteMapping("/{userId:\\d+}/health-records/{id:\\d+}")
    public ResponseEntity<Void> deleteHealthRecord(
            @PathVariable("userId") Long userId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole
    ) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank()) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        healthRecordService.deleteHealthRecord(id);
        return ResponseEntity.noContent().build();
    }

}
