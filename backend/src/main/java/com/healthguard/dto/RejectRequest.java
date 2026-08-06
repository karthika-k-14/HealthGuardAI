package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Optional body for rejecting a pending registration.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RejectRequest {

    private String reason;
}
