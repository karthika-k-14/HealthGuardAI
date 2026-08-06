package com.healthguard.mapper;

import com.healthguard.dto.AdminRegisterRequest;
import com.healthguard.dto.AshaRegisterRequest;
import com.healthguard.dto.BaseRegisterRequest;
import com.healthguard.dto.CitizenRegisterRequest;
import com.healthguard.dto.OfficerRegisterRequest;
import com.healthguard.dto.PharmacistRegisterRequest;
import com.healthguard.dto.UserSummaryResponse;
import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Admin;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.AshaWorkerStatus;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.HealthOfficer;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Role;
import com.healthguard.entity.User;
import org.springframework.stereotype.Component;

/**
 * Converts registration request DTOs into their corresponding entities, and
 * entities into the compact {@link UserSummaryResponse} returned by auth
 * endpoints.
 * <p>
 * Registration only ever collects identity + credentials (see the
 * simplified {@code *RegisterRequest} DTOs); everything else - profile
 * details, village/PHC/district assignment - is filled in later via the
 * Complete Profile step or by an Admin, so none of it is mapped here.
 */
@Component
public class AuthMapper {

    public Citizen toCitizen(CitizenRegisterRequest req, String encodedPassword) {
        Citizen citizen = Citizen.builder().build();
        applyBaseFields(citizen, req, encodedPassword, Role.CITIZEN, AccountStatus.ACTIVE);
        return citizen;
    }

    public AshaWorker toAshaWorker(AshaRegisterRequest req, String encodedPassword) {
        AshaWorker worker = AshaWorker.builder()
                .employeeId(req.getEmployeeId())
                .status(AshaWorkerStatus.ACTIVE)
                .build();
        applyBaseFields(worker, req, encodedPassword, Role.ASHA_WORKER, AccountStatus.PENDING);
        return worker;
    }

    public HealthOfficer toHealthOfficer(OfficerRegisterRequest req, String encodedPassword) {
        HealthOfficer officer = HealthOfficer.builder()
                .employeeId(req.getEmployeeId())
                .build();
        applyBaseFields(officer, req, encodedPassword, Role.HEALTH_OFFICER, AccountStatus.PENDING);
        return officer;
    }

    public Pharmacist toPharmacist(PharmacistRegisterRequest req, String encodedPassword) {
        Pharmacist pharmacist = Pharmacist.builder()
                .employeeId(req.getEmployeeId())
                .licenseNumber(req.getLicenseNumber())
                .build();
        applyBaseFields(pharmacist, req, encodedPassword, Role.PHARMACIST, AccountStatus.PENDING);
        return pharmacist;
    }

    public Admin toAdmin(AdminRegisterRequest req, String encodedPassword) {
        Admin admin = Admin.builder()
                .employeeId(req.getEmployeeId())
                .designation(req.getDesignation())
                .build();
        applyBaseFields(admin, req, encodedPassword, Role.ADMIN, AccountStatus.ACTIVE);
        return admin;
    }

    public UserSummaryResponse toUserSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .profileCompleted(user.getProfileCompleted())
                .build();
    }

    /**
     * Applies the identity/credential fields common to every role onto an
     * already-constructed subtype instance, and sets the account status
     * appropriate for that role (Citizens/Admins go straight to ACTIVE;
     * every other staff role starts PENDING until an Admin approves it).
     */
    private void applyBaseFields(User user, BaseRegisterRequest req, String encodedPassword,
                                  Role role, AccountStatus initialStatus) {
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(encodedPassword);
        user.setIsVerified(initialStatus == AccountStatus.ACTIVE);
        user.setIsActive(true);
        user.setProfileCompleted(false);
        user.setRole(role);
        user.setAccountStatus(initialStatus);
    }
}
