package com.healthguard.admin.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettingsDTO {
    private Boolean darkMode;
    private String language;
    private Boolean emailAlerts;
    private Boolean smsAlerts;
    private Boolean locationSharing;
    private Boolean twoFactorEnabled;
}
