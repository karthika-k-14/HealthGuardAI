package com.healthguard.ai.repository;

import com.healthguard.ai.entity.SymptomAssessment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomAssessmentRepository extends JpaRepository<SymptomAssessment, Long> {

    List<SymptomAssessment> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<SymptomAssessment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<SymptomAssessment> findByRiskLevelIgnoreCaseOrderByCreatedAtDesc(String riskLevel, Pageable pageable);

    @Query("SELECT s FROM SymptomAssessment s WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(s.symptoms) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.prediction) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.recommendation) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SymptomAssessment> searchAssessments(@Param("keyword") String keyword, Pageable pageable);
}

