package com.healthguard.ai.repository;

import com.healthguard.ai.entity.MedicalKnowledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalKnowledgeRepository extends JpaRepository<MedicalKnowledge, Long> {

    List<MedicalKnowledge> findByCategory(String category);

    @Query(value = "SELECT * FROM medical_knowledge WHERE LOWER(category) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(content) LIKE LOWER(CONCAT('%', :keyword, '%')) LIMIT :limit", nativeQuery = true)
    List<MedicalKnowledge> searchRelevantKnowledge(@Param("keyword") String keyword, @Param("limit") int limit);
}
