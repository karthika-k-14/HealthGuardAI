package com.healthguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * An awareness article as returned by the Awareness Article CRUD endpoints
 * ({@code /awareness-articles/**}, {@code /admin/awareness-articles/**}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AwarenessArticleResponse {

    private Long id;
    private UUID uuid;
    private String title;
    private String category;
    private String summary;
    private String content;
    private String imageUrl;
    private String author;
    private LocalDate publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
