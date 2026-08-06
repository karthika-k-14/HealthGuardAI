package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Optional body for the admin review actions on a scheme application
 * (mark-eligible / approve / reject) - carries an optional remark such as
 * an eligibility note or a rejection reason.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchemeApplicationReviewRequest {

    private String remarks;
}
