package com.healthguard.citizen.controller;

import com.healthguard.citizen.dto.FamilyMemberRequest;
import com.healthguard.citizen.dto.FamilyMemberResponse;
import com.healthguard.citizen.service.FamilyMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citizens")
@RequiredArgsConstructor
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;

    @GetMapping({ "/family-members", "/{userId:\\d+}/family-members" })
    public ResponseEntity<List<FamilyMemberResponse>> getFamilyMembers(
            @PathVariable(name = "userId", required = false) Long pathUserId,
            @RequestParam(name = "userId", required = false) Long paramUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole
    ) {
        Long targetId = pathUserId != null ? pathUserId : paramUserId;
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
        return ResponseEntity.ok(familyMemberService.getFamilyMembersByUserId(targetId));
    }

    @PostMapping({ "/family-members", "/{userId:\\d+}/family-members" })
    public ResponseEntity<FamilyMemberResponse> addFamilyMember(
            @PathVariable(name = "userId", required = false) Long pathUserId,
            @RequestParam(name = "userId", required = false) Long paramUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestBody FamilyMemberRequest request
    ) {
        Long targetId = pathUserId != null ? pathUserId : (request != null && request.getUserId() != null ? request.getUserId() : paramUserId);
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
        return new ResponseEntity<>(familyMemberService.addFamilyMember(targetId, request), HttpStatus.CREATED);
    }


    @PutMapping({ "/family-members/{id:\\d+}", "/{userId:\\d+}/family-members/{id:\\d+}" })
    public ResponseEntity<FamilyMemberResponse> updateFamilyMember(
            @PathVariable(name = "userId", required = false) Long pathUserId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole,
            @RequestBody FamilyMemberRequest request
    ) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank() && pathUserId != null) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(pathUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        return ResponseEntity.ok(familyMemberService.updateFamilyMember(id, request));
    }

    @DeleteMapping({ "/family-members/{id:\\d+}", "/{userId:\\d+}/family-members/{id:\\d+}" })
    public ResponseEntity<Void> deleteFamilyMember(
            @PathVariable(name = "userId", required = false) Long pathUserId,
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole
    ) {
        if ("CITIZEN".equalsIgnoreCase(headerUserRole) && headerUserId != null && !headerUserId.isBlank() && pathUserId != null) {
            Long callerId = Long.valueOf(headerUserId);
            if (!callerId.equals(pathUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.noContent().build();
    }


}
