package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.AIAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIAnalysisRepository extends JpaRepository<AIAnalysis, Long> {

    List<AIAnalysis> findByCitizenId(Long citizenId);

    List<AIAnalysis> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    List<AIAnalysis> findByUrgency(String urgency);

    List<AIAnalysis> findByDisease(String disease);
}
