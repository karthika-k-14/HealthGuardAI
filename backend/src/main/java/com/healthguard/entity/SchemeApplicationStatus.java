package com.healthguard.entity;

/**
 * Lifecycle of a citizen's application to a {@link Scheme}.
 * <p>
 * PENDING -&gt; ELIGIBLE -&gt; APPROVED is the "happy path"; a PENDING or
 * ELIGIBLE application may instead be moved straight to REJECTED.
 */
public enum SchemeApplicationStatus {
    PENDING,
    ELIGIBLE,
    APPROVED,
    REJECTED
}
