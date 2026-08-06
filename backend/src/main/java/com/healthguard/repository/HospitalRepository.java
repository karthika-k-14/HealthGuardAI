package com.healthguard.repository;

import com.healthguard.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    List<Hospital> findByDistrict(String district);

    List<Hospital> findByType(String type);

    // ---- Analytics Module (Phase 12) -----------------------------------

    @Query("SELECT COALESCE(SUM(h.beds), 0) FROM Hospital h")
    long sumTotalBeds();

    @Query("SELECT COUNT(h) FROM Hospital h WHERE h.emergencyServices = true")
    long countByEmergencyServicesTrue();

    @Query("SELECT h.type, COUNT(h) FROM Hospital h WHERE h.type IS NOT NULL GROUP BY h.type")
    List<Object[]> countGroupedByType();

    @Query("SELECT h.status, COUNT(h) FROM Hospital h WHERE h.status IS NOT NULL GROUP BY h.status")
    List<Object[]> countGroupedByStatus();
}

