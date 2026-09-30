package com.healthguard.community.repository;

import com.healthguard.community.entity.HomeVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomeVisitRepository extends JpaRepository<HomeVisit, Long> {
    List<HomeVisit> findByAshaWorkerId(Long ashaWorkerId);
    List<HomeVisit> findByStatus(String status);
    List<HomeVisit> findByCitizenId(Long citizenId);

    @Query("SELECT COUNT(h) FROM HomeVisit h WHERE LOWER(h.vaccinationStatus) LIKE '%done%' OR LOWER(h.vaccinationStatus) LIKE '%complete%'")
    long countCompletedVaccinations();

    @Query("SELECT COUNT(h) FROM HomeVisit h WHERE LOWER(h.vaccinationStatus) LIKE '%missed%' OR LOWER(h.vaccinationStatus) LIKE '%due%'")
    long countMissedVaccinations();

    @Query("SELECT COUNT(h) FROM HomeVisit h WHERE h.pregnancyStatus IS NOT NULL AND h.pregnancyStatus != ''")
    long countMaternalRecords();

    @Query("SELECT COUNT(h) FROM HomeVisit h WHERE h.riskLevel = 'High' OR h.riskLevel = 'Critical'")
    long countHighRiskVisits();
}
