package com.healthguard.service;

import com.healthguard.dto.AdminRegisterRequest;
import com.healthguard.dto.ApprovalStatsResponse;
import com.healthguard.dto.AssignAshaRequest;
import com.healthguard.dto.AssignOfficerRequest;
import com.healthguard.dto.AssignPharmacistRequest;
import com.healthguard.dto.PendingUserResponse;
import com.healthguard.dto.RejectRequest;
import com.healthguard.dto.UserSummaryResponse;
import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.HealthOfficer;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Role;
import com.healthguard.entity.User;
import com.healthguard.entity.Village;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.AuthMapper;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.HealthOfficerRepository;
import com.healthguard.repository.PharmacistRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.UserRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Everything an Admin does around onboarding: reviewing pending staff
 * registrations, approving/rejecting/suspending/deactivating accounts,
 * assigning villages/PHCs/districts, and creating further Admin accounts.
 * <p>
 * This is the only place Admin accounts get created - there is no public
 * admin registration page. Every method here is only reachable through
 * {@code AdminController}, which requires an authenticated ROLE_ADMIN
 * caller (see the "/admin/**" matcher in {@code SecurityConfig}).
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final HealthOfficerRepository healthOfficerRepository;
    private final PharmacistRepository pharmacistRepository;
    private final VillageRepository villageRepository;
    private final PhcRepository phcRepository;
    private final AuthService authService;
    private final AuthMapper authMapper;

    @Transactional(readOnly = true)
    public List<PendingUserResponse> listPending() {
        return userRepository.findByAccountStatus(AccountStatus.PENDING).stream()
                .filter(user -> user.getRole() == Role.ASHA_WORKER
                        || user.getRole() == Role.HEALTH_OFFICER
                        || user.getRole() == Role.PHARMACIST)
                .map(this::toPendingResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApprovalStatsResponse approvalStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long pending = userRepository.countByAccountStatus(AccountStatus.PENDING);
        long approvedToday = userRepository.countByAccountStatusAndUpdatedAtBetween(
                AccountStatus.ACTIVE, startOfDay, endOfDay);
        long rejectedToday = userRepository.countByAccountStatusAndUpdatedAtBetween(
                AccountStatus.REJECTED, startOfDay, endOfDay);
        return ApprovalStatsResponse.builder()
                .pendingCount(pending)
                .approvedToday(approvedToday)
                .rejectedToday(rejectedToday)
                .build();
    }

    @Transactional
    public UserSummaryResponse approve(Long userId) {
        User user = findUser(userId);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setIsVerified(true);
        return authMapper.toUserSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse reject(Long userId, RejectRequest request) {
        User user = findUser(userId);
        user.setAccountStatus(AccountStatus.REJECTED);
        return authMapper.toUserSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse suspend(Long userId) {
        User user = findUser(userId);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        return authMapper.toUserSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse deactivate(Long userId) {
        User user = findUser(userId);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        user.setIsActive(false);
        return authMapper.toUserSummary(userRepository.save(user));
    }

    @Transactional
    public UserSummaryResponse assignAsha(Long userId, AssignAshaRequest request) {
        AshaWorker worker = ashaWorkerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("ASHA worker not found with id: " + userId));
        Village village = villageRepository.findById(request.getVillageId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Village not found with id: " + request.getVillageId()));
        worker.setAssignedVillage(village);
        if (request.getPhcId() != null) {
            Phc phc = phcRepository.findById(request.getPhcId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "PHC not found with id: " + request.getPhcId()));
            worker.setAssignedPHC(phc);
        }
        return authMapper.toUserSummary(ashaWorkerRepository.save(worker));
    }

    @Transactional
    public UserSummaryResponse assignOfficer(Long userId, AssignOfficerRequest request) {
        HealthOfficer officer = healthOfficerRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Health Officer not found with id: " + userId));
        officer.setOfficerDistrict(request.getDistrict());
        HealthOfficer saved = healthOfficerRepository.save(officer);

        if (request.getVillageIds() != null && !request.getVillageIds().isEmpty()) {
            List<Village> villages = villageRepository.findAllById(request.getVillageIds());
            villages.forEach(village -> village.setHealthOfficer(saved));
            villageRepository.saveAll(villages);
        }
        return authMapper.toUserSummary(saved);
    }

    @Transactional
    public UserSummaryResponse assignPharmacist(Long userId, AssignPharmacistRequest request) {
        Pharmacist pharmacist = pharmacistRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found with id: " + userId));
        pharmacist.setPhcName(request.getPhcName());
        pharmacist.setPharmacyName(request.getPharmacyName());
        return authMapper.toUserSummary(pharmacistRepository.save(pharmacist));
    }

    /**
     * Creates a new Admin. Reuses {@code AuthService.registerAdmin} for the
     * actual entity creation/validation, but only ever returns the created
     * user's summary - it deliberately does not hand the calling Admin a
     * fresh token for the new account.
     */
    @Transactional
    public UserSummaryResponse createAdmin(AdminRegisterRequest request) {
        return authService.registerAdmin(request).getUser();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private PendingUserResponse toPendingResponse(User user) {
        String employeeId = null;
        String licenseNumber = null;
        if (user instanceof AshaWorker worker) {
            employeeId = worker.getEmployeeId();
        } else if (user instanceof HealthOfficer officer) {
            employeeId = officer.getEmployeeId();
        } else if (user instanceof Pharmacist pharmacist) {
            employeeId = pharmacist.getEmployeeId();
            licenseNumber = pharmacist.getLicenseNumber();
        }
        return PendingUserResponse.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .employeeId(employeeId)
                .licenseNumber(licenseNumber)
                .accountStatus(user.getAccountStatus())
                .submittedAt(user.getCreatedAt())
                .build();
    }
}
