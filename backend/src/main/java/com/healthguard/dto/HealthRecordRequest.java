package com.healthguard.dto;

import com.healthguard.entity.HealthRecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Request body for creating or updating a {@link com.healthguard.entity.HealthRecord}
 * entry under the authenticated citizen's health history.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordRequest {

    @NotNull(message = "Record type is required")
    private HealthRecordType recordType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String doctorName;

    private String hospitalName;

    @NotNull(message = "Record date is required")
    @PastOrPresent(message = "Record date cannot be in the future")
    private LocalDate recordDate;

    private String attachmentUrl;
}
