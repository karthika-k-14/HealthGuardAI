package com.healthguard.entity;

/**
 * Category of a {@link HealthRecord} entry in a citizen's health history.
 */
public enum HealthRecordType {
    CONSULTATION,
    LAB_REPORT,
    PRESCRIPTION,
    VACCINATION,
    SURGERY,
    OTHER
}
