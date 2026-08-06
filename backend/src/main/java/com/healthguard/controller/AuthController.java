package com.healthguard.controller;

import com.healthguard.dto.AshaRegisterRequest;
import com.healthguard.dto.CitizenRegisterRequest;
import com.healthguard.dto.LoginRequest;
import com.healthguard.dto.LoginResponse;
import com.healthguard.dto.OfficerRegisterRequest;
import com.healthguard.dto.PharmacistRegisterRequest;
import com.healthguard.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public authentication endpoints: self-registration for Citizen, ASHA
 * Worker, Health Officer, and Pharmacist, plus a single login endpoint
 * shared by every role. All of these are permitted without a token (see
 * {@code SecurityConfig}).
 * <p>
 * There is deliberately NO public Admin registration endpoint here - an
 * Admin account can only be created by an already-authenticated Admin,
 * via {@code AdminController}'s "/admin/admins" endpoint.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Public authentication and role-based self-registration endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/citizen")
    @Operation(summary = "Register a new Citizen", description = "Registers a new Citizen account (immediately active).")
    public ResponseEntity<LoginResponse> registerCitizen(@Valid @RequestBody CitizenRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerCitizen(request));
    }

    @PostMapping("/register/asha")
    @Operation(summary = "Register a new ASHA Worker", description = "Registers a new ASHA Worker account (pending admin approval).")
    public ResponseEntity<LoginResponse> registerAsha(@Valid @RequestBody AshaRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerAshaWorker(request));
    }

    @PostMapping("/register/officer")
    @Operation(summary = "Register a new Health Officer", description = "Registers a new Health Officer account (pending admin approval).")
    public ResponseEntity<LoginResponse> registerOfficer(@Valid @RequestBody OfficerRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerHealthOfficer(request));
    }

    @PostMapping("/register/pharmacist")
    @Operation(summary = "Register a new Pharmacist", description = "Registers a new Pharmacist account (pending admin approval).")
    public ResponseEntity<LoginResponse> registerPharmacist(@Valid @RequestBody PharmacistRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerPharmacist(request));
    }

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and issues a JWT token for valid active accounts.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}

