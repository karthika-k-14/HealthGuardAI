package com.healthguard.entity;

/**
 * Lifecycle status of a user account, independent of {@code Role}.
 * <p>
 * Citizens and Admins go straight to {@code ACTIVE}. Every other staff
 * role (ASHA Worker, Health Officer, Pharmacist) starts {@code PENDING}
 * until an Admin reviews and approves the registration. Only
 * {@code ACTIVE} accounts are permitted to log in.
 */
public enum AccountStatus {
    PENDING,
    ACTIVE,
    REJECTED,
    SUSPENDED
}
