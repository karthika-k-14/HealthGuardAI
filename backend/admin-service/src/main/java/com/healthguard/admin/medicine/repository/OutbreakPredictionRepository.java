package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.OutbreakPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutbreakPredictionRepository extends JpaRepository<OutbreakPrediction, Long> {

    List<OutbreakPrediction> findTop20ByOrderByRiskScoreDescCasesPredictedDesc();

    List<OutbreakPrediction> findByVillage(String village);
}
