package com.healthguard.mapper;

import com.healthguard.dto.AwarenessArticleResponse;
import com.healthguard.entity.AwarenessArticle;
import org.springframework.stereotype.Component;

/**
 * Converts between {@link AwarenessArticle} and its DTOs for the Awareness
 * Article CRUD module.
 */
@Component
public class AwarenessArticleMapper {

    public AwarenessArticleResponse toResponse(AwarenessArticle article) {
        return AwarenessArticleResponse.builder()
                .id(article.getId())
                .uuid(article.getUuid())
                .title(article.getTitle())
                .category(article.getCategory())
                .summary(article.getSummary())
                .content(article.getContent())
                .imageUrl(article.getImageUrl())
                .author(article.getAuthor())
                .publishedAt(article.getPublishedAt())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt())
                .build();
    }
}
