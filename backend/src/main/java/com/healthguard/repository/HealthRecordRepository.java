package com.healthguard.repository;

import com.healthguard.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {

    List<HealthRecord> findByCitizenIdOrderByRecordDateDesc(Long citizenId);

    Optional<HealthRecord> findByIdAndCitizenId(Long id, Long citizenId);

    // ---- Health Officer module (Phase 3) -------------------------------
    // Disease Monitoring / Health Reports have no dedicated entity yet, so
    // they are approximated from the health records citizens have logged
    // in the officer's villages (the closest existing source of "reports"
    // filed against a village/citizen).

    @Query("SELECT hr FROM HealthRecord hr WHERE hr.citizen.village.id IN :villageIds "
            + "ORDER BY hr.recordDate DESC")
    List<HealthRecord> findByVillageIdsOrderByRecordDateDesc(@Param("villageIds") List<Long> villageIds);

    @Query("SELECT COUNT(hr) FROM HealthRecord hr WHERE hr.citizen.village.id IN :villageIds "
            + "AND hr.recordDate = :date")
    long countByVillageIdsAndRecordDate(@Param("villageIds") List<Long> villageIds, @Param("date") LocalDate date);

    @Query("SELECT COUNT(hr) FROM HealthRecord hr WHERE hr.citizen.village.id IN :villageIds "
            + "AND hr.recordDate BETWEEN :start AND :end")
    long countByVillageIdsAndRecordDateBetween(@Param("villageIds") List<Long> villageIds,
                                                @Param("start") LocalDate start,
                                                @Param("end") LocalDate end);

    // ---- Analytics Module (Phase 12) -----------------------------------

    @Query("SELECT hr.recordType, COUNT(hr) FROM HealthRecord hr GROUP BY hr.recordType")
    List<Object[]> countGroupedByRecordType();

    @Query("SELECT COUNT(hr) FROM HealthRecord hr WHERE hr.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

