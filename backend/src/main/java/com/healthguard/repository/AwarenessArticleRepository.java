package com.healthguard.repository;

import com.healthguard.entity.AwarenessArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwarenessArticleRepository extends JpaRepository<AwarenessArticle, Long> {

    List<AwarenessArticle> findByCategory(String category);

    List<AwarenessArticle> findByTitleContainingIgnoreCaseOrSummaryContainingIgnoreCase(String title, String summary);

    List<AwarenessArticle> findByCategoryAndTitleContainingIgnoreCaseOrCategoryAndSummaryContainingIgnoreCase(
            String categoryForTitle, String title, String categoryForSummary, String summary);

    List<AwarenessArticle> findAllByOrderByPublishedAtDescCreatedAtDesc();
}
