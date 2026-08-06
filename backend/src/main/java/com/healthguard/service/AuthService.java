package com.healthguard.service;

import com.healthguard.dto.AdminRegisterRequest;
import com.healthguard.dto.AshaRegisterRequest;
import com.healthguard.dto.BaseRegisterRequest;
import com.healthguard.dto.CitizenRegisterRequest;
import com.healthguard.dto.LoginRequest;
import com.healthguard.dto.LoginResponse;
import com.healthguard.dto.OfficerRegisterRequest;
import com.healthguard.dto.PharmacistRegisterRequest;
import com.healthguard.entity.Admin;
import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.HealthOfficer;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.User;
import com.healthguard.exception.AuthenticationFailedException;
import com.healthguard.exception.BadRequestException;
import com.healthguard.mapper.AuthMapper;
import com.healthguard.repository.AdminRepository;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.HealthOfficerRepository;
import com.healthguard.repository.PharmacistRepository;
import com.healthguard.repository.UserRepository;
import com.healthguard.security.JwtService;
import com.healthguard.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Owns every authentication use case: registering each role and logging in.
 * <p>
 * Registration only ever collects identity + credentials. Citizens (and
 * Admins, created only by another Admin - see {@code AdminService}) go
 * straight to {@code ACTIVE} and receive a usable JWT immediately. Every
 * other staff role starts {@code PENDING} and receives no usable session
 * until an Admin approves the registration.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final HealthOfficerRepository healthOfficerRepository;
    private final PharmacistRepository pharmacistRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public LoginResponse registerCitizen(CitizenRegisterRequest request) {
        validateUnique(request);
        Citizen citizen = authMapper.toCitizen(request, encode(request.getPassword()));
        Citizen saved = citizenRepository.save(citizen);
        return buildAuthResponse(saved);
    }

    @Transactional
    public LoginResponse registerAshaWorker(AshaRegisterRequest request) {
        validateUnique(request);
        validateEmployeeIdUnique(request.getEmployeeId(), ashaWorkerRepository.findByEmployeeId(request.getEmployeeId()).isPresent());
        AshaWorker worker = authMapper.toAshaWorker(request, encode(request.getPassword()));
        AshaWorker saved = ashaWorkerRepository.save(worker);
        return buildAuthResponse(saved);
    }

    @Transactional
    public LoginResponse registerHealthOfficer(OfficerRegisterRequest request) {
        validateUnique(request);
        validateEmployeeIdUnique(request.getEmployeeId(), healthOfficerRepository.findByEmployeeId(request.getEmployeeId()).isPresent());
        HealthOfficer officer = authMapper.toHealthOfficer(request, encode(request.getPassword()));
        HealthOfficer saved = healthOfficerRepository.save(officer);
        return buildAuthResponse(saved);
    }

    @Transactional
    public LoginResponse registerPharmacist(PharmacistRegisterRequest request) {
        validateUnique(request);
        validateEmployeeIdUnique(request.getEmployeeId(), pharmacistRepository.findByEmployeeId(request.getEmployeeId()).isPresent());
        Pharmacist pharmacist = authMapper.toPharmacist(request, encode(request.getPassword()));
        Pharmacist saved = pharmacistRepository.save(pharmacist);
        return buildAuthResponse(saved);
    }

    /**
     * Creates a new Admin account. There is no public admin registration
     * page - this is only ever reachable through {@code AdminService},
     * which is itself only exposed to an already-authenticated ROLE_ADMIN
     * caller (see {@code SecurityConfig}'s "/admin/**" matcher).
     */
    @Transactional
    public LoginResponse registerAdmin(AdminRegisterRequest request) {
        validateUnique(request);
        validateEmployeeIdUnique(request.getEmployeeId(), adminRepository.findByEmployeeId(request.getEmployeeId()).isPresent());
        Admin admin = authMapper.toAdmin(request, encode(request.getPassword()));
        Admin saved = adminRepository.save(admin);
        return buildAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        userRepository.findByEmail(request.getEmailOrPhone())
                .or(() -> userRepository.findByPhone(request.getEmailOrPhone()))
                .ifPresent(this::rejectIfNotLoginable);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmailOrPhone(), request.getPassword()));
        } catch (DisabledException e) {
            throw new AuthenticationFailedException("This account has been deactivated");
        } catch (AuthenticationException e) {
            throw new AuthenticationFailedException("Invalid email/phone or password");
        }

        User user = ((UserPrincipal) authentication.getPrincipal()).getUser();
        return buildAuthResponse(user);
    }

    // ---------------------------------------------------------------
    // Shared helpers
    // ---------------------------------------------------------------

    /**
     * Blocks login attempts for any account that isn't ACTIVE, with a
     * message specific to why (still awaiting review, rejected, or
     * suspended), before credentials are even checked.
     */
    private void rejectIfNotLoginable(User user) {
        switch (user.getAccountStatus()) {
            case PENDING -> throw new AuthenticationFailedException(
                    "Your account is awaiting administrator approval.");
            case REJECTED -> throw new AuthenticationFailedException(
                    "Your registration was rejected. Please contact the administrator.");
            case SUSPENDED -> throw new AuthenticationFailedException(
                    "Your account has been suspended. Please contact the administrator.");
            case ACTIVE -> {
                // Fine - proceed to normal credential verification.
            }
        }
    }

    private String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    private void validateUnique(BaseRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number is already registered: " + request.getPhone());
        }
    }

    private void validateEmployeeIdUnique(String employeeId, boolean alreadyExists) {
        if (alreadyExists) {
            throw new BadRequestException("Employee ID is already registered: " + employeeId);
        }
    }

    /**
     * Builds the shared auth response. A working JWT is only issued for
     * ACTIVE accounts (Citizens immediately; staff only once an Admin has
     * approved them) - everyone else gets their status and a human-readable
     * message instead, so the frontend can route to the Pending Approval
     * page without ever holding a usable session.
     */
    private LoginResponse buildAuthResponse(User user) {
        boolean loginable = user.getAccountStatus() == AccountStatus.ACTIVE;
        String token = loginable ? jwtService.generateToken(user) : null;
        return LoginResponse.builder()
                .token(token)
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .message(statusMessage(user.getAccountStatus()))
                .user(authMapper.toUserSummary(user))
                .build();
    }

    private String statusMessage(AccountStatus status) {
        return switch (status) {
            case PENDING -> "Your registration has been submitted for verification.";
            case REJECTED -> "Your registration was rejected. Please contact the administrator.";
            case SUSPENDED -> "Your account has been suspended. Please contact the administrator.";
            case ACTIVE -> "Login successful.";
        };
    }
}
