package com.healthguard.controller;

import com.healthguard.dto.SchemeApplicationRequest;
import com.healthguard.dto.SchemeApplicationResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.SchemeApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Citizen-facing Scheme Beneficiary Management endpoints: applying for a
 * scheme and viewing the status of one's own applications.
 * <p>
 * Covered by the existing "/citizen/**" -&gt; ROLE_CITIZEN matcher in
 * {@code SecurityConfig}.
 */
@RestController
@RequestMapping("/citizen/scheme-applications")
@RequiredArgsConstructor
@Tag(name = "Scheme Applications (Citizen)", description = "Apply for a scheme and track your own applications")
public class SchemeApplicationController {

    private final SchemeApplicationService schemeApplicationService;

    @PostMapping
    @Operation(summary = "Apply for a scheme")
    public ResponseEntity<SchemeApplicationResponse> apply(@AuthenticationPrincipal UserPrincipal principal,
                                                             @Valid @RequestBody SchemeApplicationRequest request) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(schemeApplicationService.apply(citizen, request));
    }

    @GetMapping
    @Operation(summary = "List the authenticated citizen's own scheme applications")
    public ResponseEntity<List<SchemeApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal) {
        Citizen citizen = requireCitizen(principal);
        return ResponseEntity.ok(schemeApplicationService.getMyApplications(citizen));
    }

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
