package com.healthguard.ai.repository;

import com.healthguard.ai.entity.NutritionPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {
    List<NutritionPlan> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<NutritionPlan> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<NutritionPlan> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT n FROM NutritionPlan n WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(n.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.possibleConditions) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(n.foodsRecommended) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<NutritionPlan> searchNutritionPlans(@Param("keyword") String keyword, Pageable pageable);
}

