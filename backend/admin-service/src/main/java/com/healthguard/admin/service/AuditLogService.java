package com.healthguard.admin.service;

import com.healthguard.admin.dto.request.AuditLogRequest;
import com.healthguard.admin.dto.response.AuditLogResponse;

import java.util.List;

public interface AuditLogService {

    AuditLogResponse createAuditLog(AuditLogRequest request);

    List<AuditLogResponse> getAllAuditLogs();

    AuditLogResponse getAuditLogById(Long id);

    void logAction(String action, String role, String details);
}
