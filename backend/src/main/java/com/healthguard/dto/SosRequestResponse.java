package com.healthguard.dto;

import com.healthguard.entity.Role;
import com.healthguard.entity.SosStatus;
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
public class SosRequestResponse {

    private Long id;
    private UUID uuid;
    private Long citizenId;
    private String citizenName;
    private String citizenPhone;
    private String emergencyType;
    private String description;
    private Double latitude;
    private Double longitude;
    private SosStatus status;
    private String respondedByName;
    private Role respondedByRole;
    private String statusNote;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
