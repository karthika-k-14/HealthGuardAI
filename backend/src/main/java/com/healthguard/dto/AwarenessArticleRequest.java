package com.healthguard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request body for {@code POST /admin/awareness-articles} and
 * {@code PUT /admin/awareness-articles/{articleId}}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AwarenessArticleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String category;

    private String summary;

    private String content;

    private String imageUrl;

    private String author;

    private LocalDate publishedAt;
}
