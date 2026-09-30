package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {

    @Query("SELECT h FROM HealthRecord h WHERE h.userId = :userId")
    List<HealthRecord> findByUserId(@Param("userId") Long userId);
}
