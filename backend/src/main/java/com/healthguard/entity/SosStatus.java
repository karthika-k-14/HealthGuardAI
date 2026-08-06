package com.healthguard.entity;

/**
 * Lifecycle status of an {@link SosRequest}.
 */
public enum SosStatus {
    PENDING,
    ACKNOWLEDGED,
    IN_PROGRESS,
    RESOLVED,
    CANCELLED
}
