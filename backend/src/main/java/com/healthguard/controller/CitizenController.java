package com.healthguard.controller;

import com.healthguard.dto.CitizenProfileResponse;
import com.healthguard.dto.CitizenProfileUpdateRequest;
import com.healthguard.dto.FamilyMemberRequest;
import com.healthguard.dto.FamilyMemberResponse;
import com.healthguard.dto.HealthRecordRequest;
import com.healthguard.dto.HealthRecordResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.CitizenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
 * Citizen Module (Phase 1): a citizen's own profile, family members, and
 * health records.
 * <p>
 * Every endpoint here requires an authenticated ROLE_CITIZEN caller - see
 * the "/citizen/**" matcher in {@code SecurityConfig}. This is deliberately
 * separate from the generic {@code /profile/**} endpoints (used by every
 * role for the one-time Complete Profile step); this controller is the
 * citizen-specific surface for ongoing profile/family/health-record
 * management and reuses the existing {@link Citizen} entity and
 * authentication - no new auth logic is introduced.
 */
@RestController
@RequestMapping("/citizen")
@RequiredArgsConstructor
@Tag(name = "Citizen", description = "Citizen profile, family members, and health records")
public class CitizenController {

    private final CitizenService citizenService;

    // ---- Profile -----------------------------------------------------

    @GetMapping("/profile")
    @Operation(summary = "Get the authenticated citizen's full profile")
    public ResponseEntity<CitizenProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.getProfile(citizen));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update the authenticated citizen's profile")
    public ResponseEntity<CitizenProfileResponse> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @Valid @RequestBody CitizenProfileUpdateRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.updateProfile(citizen, request));
    }

    // ---- Family members ------------------------------------------------

    @GetMapping("/family-members")
    @Operation(summary = "List the authenticated citizen's family members")
    public ResponseEntity<List<FamilyMemberResponse>> listFamilyMembers(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.listFamilyMembers(citizen));
    }

    @PostMapping("/family-members")
    @Operation(summary = "Add a family member")
    public ResponseEntity<FamilyMemberResponse> addFamilyMember(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @Valid @RequestBody FamilyMemberRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(citizenService.addFamilyMember(citizen, request));
    }

    @PutMapping("/family-members/{memberId}")
    @Operation(summary = "Update a family member")
    public ResponseEntity<FamilyMemberResponse> updateFamilyMember(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @PathVariable Long memberId,
                                                                    @Valid @RequestBody FamilyMemberRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.updateFamilyMember(citizen, memberId, request));
    }

    @DeleteMapping("/family-members/{memberId}")
    @Operation(summary = "Remove a family member")
    public ResponseEntity<Void> deleteFamilyMember(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long memberId) {
        Citizen citizen = requireCitizen(principal);
        citizenService.deleteFamilyMember(citizen, memberId);
        return ResponseEntity.noContent().build();
    }

    // ---- Health records ------------------------------------------------

    @GetMapping("/health-records")
    @Operation(summary = "List the authenticated citizen's health records")
    public ResponseEntity<List<HealthRecordResponse>> listHealthRecords(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.listHealthRecords(citizen));
    }

    @PostMapping("/health-records")
    @Operation(summary = "Add a health record")
    public ResponseEntity<HealthRecordResponse> addHealthRecord(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @Valid @RequestBody HealthRecordRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(citizenService.addHealthRecord(citizen, request));
    }

    @PutMapping("/health-records/{recordId}")
    @Operation(summary = "Update a health record")
    public ResponseEntity<HealthRecordResponse> updateHealthRecord(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @PathVariable Long recordId,
                                                                    @Valid @RequestBody HealthRecordRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(citizenService.updateHealthRecord(citizen, recordId, request));
    }

    @DeleteMapping("/health-records/{recordId}")
    @Operation(summary = "Remove a health record")
    public ResponseEntity<Void> deleteHealthRecord(@AuthenticationPrincipal UserPrincipal principal,
                                                    @PathVariable Long recordId) {
        Citizen citizen = requireCitizen(principal);
        citizenService.deleteHealthRecord(citizen, recordId);
        return ResponseEntity.noContent().build();
    }

    // ---- Helpers -----------------------------------------------------

    /**
     * Every endpoint here is already restricted to ROLE_CITIZEN by
     * {@code SecurityConfig}, so this cast should always succeed; the
     * explicit check just guards against that invariant ever changing
     * without also updating this controller.
     */
    private Citizen requireCitizen(UserPrincipal principal) {
        if (principal.getUser() instanceof Citizen citizen) {
            return citizen;
        }
        throw new BadRequestException("Only citizens can access this resource");
    }
}
