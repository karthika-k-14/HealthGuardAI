package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.GovernmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GovernmentSchemeRepository extends JpaRepository<GovernmentScheme, Long> {

    List<GovernmentScheme> findAllByIsActiveTrueOrderByCreatedAtDesc();

    List<GovernmentScheme> findByCategoryIgnoreCaseAndIsActiveTrue(String category);

    List<GovernmentScheme> findByStateIgnoreCaseAndIsActiveTrue(String state);

    @Query("SELECT s FROM GovernmentScheme s WHERE s.isActive = true " +
           "AND (:category IS NULL OR LOWER(s.category) = LOWER(:category)) " +
           "AND (:state IS NULL OR LOWER(s.state) = LOWER(:state) OR LOWER(s.state) = 'all india') " +
           "AND (:search IS NULL OR LOWER(s.schemeName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.benefits) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY s.id ASC")
    List<GovernmentScheme> filterSchemes(
            @Param("category") String category,
            @Param("state") String state,
            @Param("search") String search
    );

    @Query("SELECT DISTINCT s.category FROM GovernmentScheme s WHERE s.isActive = true ORDER BY s.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT s.state FROM GovernmentScheme s WHERE s.isActive = true ORDER BY s.state")
    List<String> findDistinctStates();
}
