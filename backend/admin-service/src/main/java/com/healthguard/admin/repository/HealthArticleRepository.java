package com.healthguard.admin.repository;

import com.healthguard.admin.entity.HealthArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthArticleRepository extends JpaRepository<HealthArticle, Long> {
    List<HealthArticle> findByStatusIgnoreCaseOrderByPublishedAtDesc(String status);
    Page<HealthArticle> findByStatusIgnoreCaseOrderByPublishedAtDesc(String status, Pageable pageable);
    
    List<HealthArticle> findByCategoryIgnoreCaseAndStatusIgnoreCaseOrderByPublishedAtDesc(String category, String status);
    Page<HealthArticle> findByCategoryIgnoreCaseAndStatusIgnoreCaseOrderByPublishedAtDesc(String category, String status, Pageable pageable);

    List<HealthArticle> findByCategoryIgnoreCaseOrderByPublishedAtDesc(String category);
    Page<HealthArticle> findByCategoryIgnoreCaseOrderByPublishedAtDesc(String category, Pageable pageable);

    List<HealthArticle> findByOrderByPublishedAtDesc();
    Page<HealthArticle> findByOrderByPublishedAtDesc(Pageable pageable);

    @Query("SELECT a FROM HealthArticle a WHERE " +
           "(:status IS NULL OR :status = 'ALL' OR LOWER(a.status) = LOWER(:status)) AND " +
           "(:category IS NULL OR :category = 'ALL' OR LOWER(a.category) = LOWER(:category)) AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<HealthArticle> searchArticles(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("status") String status,
            Pageable pageable
    );
}

