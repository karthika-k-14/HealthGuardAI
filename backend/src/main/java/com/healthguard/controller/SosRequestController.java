package com.healthguard.controller;

import com.healthguard.dto.SosRequestCreateRequest;
import com.healthguard.dto.SosRequestResponse;
import com.healthguard.dto.SosStatusUpdateRequest;
import com.healthguard.entity.Citizen;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.SosRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * SOS Request feature: a citizen raises an SOS, responding staff
 * (ASHA worker / Health Officer / Admin) view and act on it.
 * <p>
 * Not under "/citizen/**", "/asha/**", etc. so it falls to the
 * "anyRequest().authenticated()" rule in {@code SecurityConfig} - reachable
 * by any authenticated role. Per-endpoint role checks (citizen-only create
 * and history, responder-only status updates and listing) are enforced in
 * {@code SosRequestService}.
 */
@RestController
@RequestMapping("/sos")
@RequiredArgsConstructor
@Tag(name = "SOS Requests", description = "Create, view, and respond to citizen SOS requests")
public class SosRequestController {

    private final SosRequestService sosRequestService;

    @PostMapping
    @Operation(summary = "Create an SOS request")
    public ResponseEntity<SosRequestResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody SosRequestCreateRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(sosRequestService.createSos(citizen, request));
    }

    @GetMapping("/{sosId}")
    @Operation(summary = "View a single SOS request (owning citizen or responding staff)")
    public ResponseEntity<SosRequestResponse> view(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long sosId) {
        return ResponseEntity.ok(sosRequestService.getSos(sosId, principal.getUser()));
    }

    @GetMapping("/history")
    @Operation(summary = "The authenticated citizen's own SOS history")
    public ResponseEntity<List<SosRequestResponse>> history(@AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(sosRequestService.getHistory(citizen));
    }

    @GetMapping
    @Operation(summary = "List every SOS request (responding staff only)")
    public ResponseEntity<List<SosRequestResponse>> listAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sosRequestService.listAll(principal.getUser()));
    }

    @GetMapping("/active")
    @Operation(summary = "List active (not yet resolved/cancelled) SOS requests (responding staff only)")
    public ResponseEntity<List<SosRequestResponse>> listActive(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(sosRequestService.listActive(principal.getUser()));
    }

    @PutMapping("/{sosId}/status")
    @Operation(summary = "Update an SOS request's status (responding staff only)")
    public ResponseEntity<SosRequestResponse> updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long sosId,
                                                             @Valid @RequestBody SosStatusUpdateRequest request) {
        return ResponseEntity.ok(sosRequestService.updateStatus(sosId, principal.getUser(), request));
    }

    private Citizen requireCitizen(UserPrincipal principal) {
        if (principal.getUser() instanceof Citizen citizen) {
            return citizen;
        }
        throw new BadRequestException("Only citizens can access this resource");
    }
}
