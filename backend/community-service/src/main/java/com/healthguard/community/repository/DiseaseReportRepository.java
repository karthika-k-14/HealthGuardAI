package com.healthguard.community.repository;

import com.healthguard.community.entity.DiseaseReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseReportRepository extends JpaRepository<DiseaseReport, Long> {
    List<DiseaseReport> findByAshaWorkerId(Long ashaWorkerId);
    List<DiseaseReport> findByStatus(String status);
    List<DiseaseReport> findByDiseaseAndVillage(String disease, String village);
    long countByDiseaseAndVillage(String disease, String village);
    List<DiseaseReport> findByReportDateBetween(java.time.LocalDate startDate, java.time.LocalDate endDate);
}
