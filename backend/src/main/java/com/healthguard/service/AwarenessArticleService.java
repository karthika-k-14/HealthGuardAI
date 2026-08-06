package com.healthguard.service;

import com.healthguard.dto.AwarenessArticleRequest;
import com.healthguard.dto.AwarenessArticleResponse;
import com.healthguard.entity.AwarenessArticle;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.AwarenessArticleMapper;
import com.healthguard.repository.AwarenessArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

/**
 * Business logic for the Awareness Article CRUD module
 * ({@code /awareness-articles/**} for reads, {@code /admin/awareness-articles/**}
 * for writes).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AwarenessArticleService {

    private final AwarenessArticleRepository awarenessArticleRepository;
    private final AwarenessArticleMapper awarenessArticleMapper;

    public List<AwarenessArticleResponse> getAllArticles() {
        return awarenessArticleRepository.findAllByOrderByPublishedAtDescCreatedAtDesc().stream()
                .map(awarenessArticleMapper::toResponse)
                .toList();
    }

    public AwarenessArticleResponse getArticleById(Long articleId) {
        return awarenessArticleMapper.toResponse(findArticleOrThrow(articleId));
    }

    /**
     * Free-text search across title/summary, optionally narrowed to a
     * single category. Either parameter may be blank/null.
     */
    public List<AwarenessArticleResponse> searchArticles(String query, String category) {
        List<AwarenessArticle> results;

        boolean hasQuery = StringUtils.hasText(query);
        boolean hasCategory = StringUtils.hasText(category);

        if (hasQuery && hasCategory) {
            results = awarenessArticleRepository
                    .findByCategoryAndTitleContainingIgnoreCaseOrCategoryAndSummaryContainingIgnoreCase(
                            category, query, category, query);
        } else if (hasQuery) {
            results = awarenessArticleRepository.findByTitleContainingIgnoreCaseOrSummaryContainingIgnoreCase(query, query);
        } else if (hasCategory) {
            results = awarenessArticleRepository.findByCategory(category);
        } else {
            results = awarenessArticleRepository.findAllByOrderByPublishedAtDescCreatedAtDesc();
        }

        return results.stream().map(awarenessArticleMapper::toResponse).toList();
    }

    @Transactional
    public AwarenessArticleResponse createArticle(AwarenessArticleRequest request) {
        AwarenessArticle article = AwarenessArticle.builder()
                .title(request.getTitle())
                .category(request.getCategory())
                .summary(request.getSummary())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .author(request.getAuthor())
                .publishedAt(request.getPublishedAt() != null ? request.getPublishedAt() : LocalDate.now())
                .build();

        return awarenessArticleMapper.toResponse(awarenessArticleRepository.save(article));
    }

    @Transactional
    public AwarenessArticleResponse updateArticle(Long articleId, AwarenessArticleRequest request) {
        AwarenessArticle article = findArticleOrThrow(articleId);

        article.setTitle(request.getTitle());
        article.setCategory(request.getCategory());
        article.setSummary(request.getSummary());
        article.setContent(request.getContent());
        article.setImageUrl(request.getImageUrl());
        article.setAuthor(request.getAuthor());
        article.setPublishedAt(request.getPublishedAt() != null ? request.getPublishedAt() : article.getPublishedAt());

        return awarenessArticleMapper.toResponse(awarenessArticleRepository.save(article));
    }

    @Transactional
    public void deleteArticle(Long articleId) {
        AwarenessArticle article = findArticleOrThrow(articleId);
        awarenessArticleRepository.delete(article);
    }

    private AwarenessArticle findArticleOrThrow(Long articleId) {
        return awarenessArticleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Awareness article not found with id: " + articleId));
    }
}
