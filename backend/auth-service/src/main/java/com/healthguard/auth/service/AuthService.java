package com.healthguard.auth.service;

import com.healthguard.auth.dto.AuthResponse;
import com.healthguard.auth.dto.LoginRequest;
import com.healthguard.auth.dto.ProfileResponse;
import com.healthguard.auth.dto.RegisterRequest;
import com.healthguard.auth.entity.User;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    User findUserByEmail(String email);

    ProfileResponse getUserProfile(String email);

    String encryptPassword(String rawPassword);

    String generateJwt(User user);

    boolean validateJwt(String token);

    void changePassword(String email, com.healthguard.auth.dto.ChangePasswordRequest request);
}
