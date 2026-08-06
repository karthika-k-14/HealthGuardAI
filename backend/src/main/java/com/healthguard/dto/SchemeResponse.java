package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * A government scheme as returned by the Scheme CRUD endpoints
 * ({@code /schemes/**}, {@code /admin/schemes/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemeResponse {

    private Long id;
    private UUID uuid;
    private String name;
    private String description;
    private String category;
    private String eligibility;
    private String applyUrl;
    private List<String> benefits;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
