package com.healthguard.dto;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.BloodGroup;
import com.healthguard.entity.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Full detail returned by {@code GET /asha/citizens/{citizenId}} - a
 * single assigned citizen's profile plus their family members and health
 * records, so an ASHA worker can see the same household/medical context a
 * citizen sees on their own profile. Read-only: this endpoint (and Phase
 * 2A as a whole) never lets an ASHA worker modify a citizen's data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignedCitizenDetailResponse {

    private Long id;
    private UUID uuid;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Gender gender;
    private LocalDate dateOfBirth;
    private Integer age;
    private BloodGroup bloodGroup;
    private String preferredLanguage;

    private String address;
    private String district;
    private String state;
    private String pincode;

    private Double height;
    private Double weight;
    private Double bmi;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String chronicDiseases;
    private String allergies;
    private String medicalHistory;

    private String villageName;
    private AccountStatus accountStatus;

    private List<FamilyMemberResponse> familyMembers;
    private List<HealthRecordResponse> healthRecords;
}
