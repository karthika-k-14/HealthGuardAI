package com.healthguard.dto;

import com.healthguard.entity.SosStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request body for responding staff updating an SOS request's status.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SosStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private SosStatus status;

    private String note;
}
