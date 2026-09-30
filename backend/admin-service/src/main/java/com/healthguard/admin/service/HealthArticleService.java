package com.healthguard.admin.service;

import com.healthguard.admin.entity.HealthArticle;
import com.healthguard.admin.repository.HealthArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthArticleService {

    private final HealthArticleRepository articleRepository;

    @Transactional
    public HealthArticle createArticle(HealthArticle article) {
        if (article.getStatus() == null || article.getStatus().isBlank()) {
            article.setStatus("DRAFT");
        }
        if (article.getPublishedAt() == null && "PUBLISHED".equalsIgnoreCase(article.getStatus())) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return articleRepository.save(article);
    }

    @Transactional
    public HealthArticle updateArticle(Long id, HealthArticle details) {
        HealthArticle article = getArticleById(id);
        article.setTitle(details.getTitle());
        article.setSummary(details.getSummary());
        article.setContent(details.getContent());
        article.setCategory(details.getCategory());
        if (details.getImageUrl() != null) {
            article.setImageUrl(details.getImageUrl());
        }
        if (details.getStatus() != null) {
            article.setStatus(details.getStatus());
            if ("PUBLISHED".equalsIgnoreCase(details.getStatus()) && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }
        return articleRepository.save(article);
    }

    @Transactional
    public HealthArticle publishArticle(Long id) {
        HealthArticle article = getArticleById(id);
        article.setStatus("PUBLISHED");
        if (article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        return articleRepository.save(article);
    }

    @Transactional
    public HealthArticle archiveArticle(Long id) {
        HealthArticle article = getArticleById(id);
        article.setStatus("ARCHIVED");
        return articleRepository.save(article);
    }

    @Transactional(readOnly = true)
    public List<HealthArticle> getAllArticles(String category, String status) {
        String queryStatus = (status != null && !status.isBlank()) ? status : "PUBLISHED";
        if (queryStatus.equalsIgnoreCase("ALL")) {
            if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
                return articleRepository.findByCategoryIgnoreCaseOrderByPublishedAtDesc(category);
            }
            return articleRepository.findByOrderByPublishedAtDesc();
        }
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) {
            return articleRepository.findByCategoryIgnoreCaseAndStatusIgnoreCaseOrderByPublishedAtDesc(category, queryStatus);
        }
        return articleRepository.findByStatusIgnoreCaseOrderByPublishedAtDesc(queryStatus);
    }

    @Transactional(readOnly = true)
    public Page<HealthArticle> searchArticles(String keyword, String category, String status, Pageable pageable) {
        return articleRepository.searchArticles(keyword, category, status, pageable);
    }

    @Transactional(readOnly = true)
    public HealthArticle getArticleById(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Health article not found with id: " + id));
    }

    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }
}

