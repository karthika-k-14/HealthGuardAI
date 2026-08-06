package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Compact citizen summary returned by {@code GET /asha/citizens} - a
 * single row in the ASHA worker's assigned-citizens list. Deliberately
 * excludes family members, health records, and other detail-only fields;
 * those are returned only by {@code GET /asha/citizens/{citizenId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignedCitizenResponse {

    private Long id;
    private UUID uuid;
    private String firstName;
    private String lastName;
    private String phone;
    private Gender gender;
    private Integer age;
    private BloodGroup bloodGroup;
    private String address;
    private String villageName;
    private AccountStatus accountStatus;
}
