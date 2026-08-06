package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Counts backing the Admin Dashboard's approval widgets.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStatsResponse {

    private long pendingCount;
    private long approvedToday;
    private long rejectedToday;
}
