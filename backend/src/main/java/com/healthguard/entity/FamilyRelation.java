package com.healthguard.entity;

/**
 * Relationship of a {@link FamilyMember} to the {@link Citizen} who added them.
 */
public enum FamilyRelation {
    SPOUSE,
    CHILD,
    PARENT,
    SIBLING,
    GRANDPARENT,
    GRANDCHILD,
    OTHER
}
