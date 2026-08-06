package com.healthguard.entity;

/**
 * Lifecycle of a {@link Prescription} as the pharmacist processes it.
 */
public enum PrescriptionStatus {
    PENDING,
    VERIFIED,
    DISPENSED,
    REJECTED
}
