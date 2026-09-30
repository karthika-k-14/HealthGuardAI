package com.healthguard.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ASHAWorkerResponse {

    private Long id;
    private String workerId;
    private String fullName;
    private String mobileNumber;
    private String email;
    private String district;
    private String village;
    private String qualification;
    private String assignedPHC;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
