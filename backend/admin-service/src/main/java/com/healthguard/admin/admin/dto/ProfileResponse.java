package com.healthguard.admin.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String location;
    private String role;
    private List<String> permissions;
    private long actionsThisMonth;
    private long usersManaged;
    private long campaignsPublished;
    private long reportsGenerated;
}
