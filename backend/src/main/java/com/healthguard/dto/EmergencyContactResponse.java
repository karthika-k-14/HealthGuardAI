package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyContactResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String relationship;
    private String phone;
    private String alternatePhone;
    private String email;
    private String address;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
}
