package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Compact view of a staff registration awaiting Admin action, shown in the
 * Admin Approval module (Pending ASHA / Health Officer / Pharmacist lists).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingUserResponse {

    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private String employeeId;
    private String licenseNumber;
    private AccountStatus accountStatus;
    private LocalDateTime submittedAt;
}
