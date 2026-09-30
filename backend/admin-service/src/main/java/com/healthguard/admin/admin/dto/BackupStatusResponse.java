package com.healthguard.admin.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupStatusResponse {
    private ZonedDateTime lastBackupAt;
    private String status;
    private Long sizeBytes;
    private String formattedSize;
    private ZonedDateTime nextScheduledBackup;
}
