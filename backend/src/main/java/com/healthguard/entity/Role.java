package com.healthguard.entity;

/**
 * System-wide user roles. Also doubles as the basis for Spring Security
 * authorities once authentication is implemented (out of scope for Phase 1).
 */
public enum Role {
    CITIZEN,
    ASHA_WORKER,
    HEALTH_OFFICER,
    PHARMACIST,
    ADMIN
}
