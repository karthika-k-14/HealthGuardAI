package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned by both the login endpoint and every registration
 * endpoint.
 * <p>
 * {@code token} is only populated when the account is ACTIVE - citizens
 * get one immediately, staff only after Admin approval. A PENDING/
 * REJECTED/SUSPENDED account instead gets {@code accountStatus} plus a
 * human-readable {@code message} the frontend can display (e.g. on the
 * Pending Approval page), with no usable session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private Role role;

    private AccountStatus accountStatus;

    private String message;

    private UserSummaryResponse user;
}
