package com.healthguard.auth.controller;

import com.healthguard.auth.dto.ApiResponse;
import com.healthguard.auth.dto.AuthResponse;
import com.healthguard.auth.dto.LoginRequest;
import com.healthguard.auth.dto.ProfileResponse;
import com.healthguard.auth.dto.RegisterRequest;
import com.healthguard.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("User logged in successfully", response));
    }

    @GetMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }
        String email = authentication.getName();
        ProfileResponse profile = authService.getUserProfile(email);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody com.healthguard.auth.dto.ChangePasswordRequest request
    ) {
        String email = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : request.getEmail();

        if (email == null || email.isBlank()) {
            throw new com.healthguard.auth.exception.InvalidCredentialsException("User email is required to change password.");
        }

        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "SUCCESS"));
    }
}
