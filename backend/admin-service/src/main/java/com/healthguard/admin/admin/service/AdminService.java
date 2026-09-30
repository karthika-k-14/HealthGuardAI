package com.healthguard.admin.admin.service;

import com.healthguard.admin.admin.dto.DashboardSummaryResponse;
import com.healthguard.admin.admin.dto.UserSummaryResponse;

import java.util.List;
import java.util.Map;

public interface AdminService {

    DashboardSummaryResponse getDashboardSummary();

    List<UserSummaryResponse> getAllUsers();

    List<UserSummaryResponse> getPendingApprovals();

    void approveUser(Long id);

    void rejectUser(Long id, String reason);

    void suspendUser(Long id);

    void deactivateUser(Long id);

    void deleteUser(Long id);

    Map<String, Object> addUser(Map<String, Object> userData);

    List<Map<String, Object>> getRoles();

    void updateRolePermissions(String roleId, Map<String, Object> body);

    List<Map<String, Object>> getAdminWorkflows();

    Map<String, Object> createWorkflow(Map<String, Object> workflowData);

    Map<String, Object> getSystemMonitoringOverview();

    List<Map<String, Object>> getSystemMonitoringServices();

    com.healthguard.admin.admin.dto.ProfileResponse getAdminProfile();

    com.healthguard.admin.admin.dto.AdminSettingsDTO getAdminSettings(Long adminId);

    com.healthguard.admin.admin.dto.AdminSettingsDTO updateAdminSettings(Long adminId, com.healthguard.admin.admin.dto.AdminSettingsDTO request);

    com.healthguard.admin.admin.dto.BackupStatusResponse getBackupStatus();

    com.healthguard.admin.admin.dto.BackupStatusResponse triggerBackup();
}

