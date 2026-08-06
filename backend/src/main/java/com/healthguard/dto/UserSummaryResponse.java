package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Compact user details returned alongside a JWT after login/registration.
 * Deliberately excludes the password and any sensitive fields.
 * <p>
 * {@code accountStatus} and {@code profileCompleted} let the frontend
 * decide where to route the user next: Pending Approval page, Complete
 * Profile page, or straight to the Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private AccountStatus accountStatus;
    private Boolean profileCompleted;
}
