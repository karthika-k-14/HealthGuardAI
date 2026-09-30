package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.MLModelMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MLModelMetricRepository extends JpaRepository<MLModelMetric, Long> {

    Optional<MLModelMetric> findFirstByIsChampionTrueOrderByTrainedAtDesc();

    List<MLModelMetric> findTop20ByOrderByTrainedAtDesc();
}
