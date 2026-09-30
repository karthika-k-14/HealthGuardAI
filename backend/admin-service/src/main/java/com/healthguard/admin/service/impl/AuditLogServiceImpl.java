package com.healthguard.admin.service.impl;

import com.healthguard.admin.dto.request.AuditLogRequest;
import com.healthguard.admin.dto.response.AuditLogResponse;
import com.healthguard.admin.entity.AuditLog;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.repository.AuditLogRepository;
import com.healthguard.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public AuditLogResponse createAuditLog(AuditLogRequest request) {
        AuditLog auditLog = mapToEntity(request);
        AuditLog savedAuditLog = auditLogRepository.save(auditLog);
        return mapToResponse(savedAuditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with id: " + id));
        return mapToResponse(auditLog);
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void logAction(String action, String role, String details) {
        try {
            String username = getCurrentUsername();
            String effectiveRole = (role != null && !role.isBlank()) ? role : getCurrentUserRole();
            AuditLogRequest request = AuditLogRequest.builder()
                    .action(action != null ? action : "UNKNOWN")
                    .performedBy(username != null ? username : "SYSTEM")
                    .role(effectiveRole != null ? effectiveRole : "ADMIN")
                    .details(details != null ? details : "")
                    .build();
            createAuditLog(request);
        } catch (Exception e) {
            System.err.println("Audit log error for action [" + action + "]: " + e.getMessage());
        }
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails) {
                return ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                return (String) principal;
            }
        }
        return "SYSTEM";
    }

    private String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ADMIN");
        }
        return "ADMIN";
    }

    private AuditLog mapToEntity(AuditLogRequest request) {
        return AuditLog.builder()
                .action(request.getAction())
                .performedBy(request.getPerformedBy())
                .role(request.getRole())
                .details(request.getDetails())
                .build();
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .performedBy(auditLog.getPerformedBy())
                .role(auditLog.getRole())
                .details(auditLog.getDetails())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}
