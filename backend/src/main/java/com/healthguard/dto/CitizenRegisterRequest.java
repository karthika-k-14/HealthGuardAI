package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Citizen self-registration. Only identity + credentials are collected here;
 * the account is activated immediately. Everything else (address, medical
 * history, village, etc.) is filled in later via the Complete Profile step.
 */
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor

public class CitizenRegisterRequest extends BaseRegisterRequest {
}
