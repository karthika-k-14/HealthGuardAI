package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.ExpiryRiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpiryRiskAlertRepository extends JpaRepository<ExpiryRiskAlert, Long> {

    Optional<ExpiryRiskAlert> findByMedicineId(Long medicineId);

    List<ExpiryRiskAlert> findByStatusOrderByDaysRemainingAsc(String status);

    List<ExpiryRiskAlert> findByRiskLevelAndStatus(String riskLevel, String status);

    List<ExpiryRiskAlert> findByDaysRemainingLessThanEqualAndStatusOrderByDaysRemainingAsc(Integer days, String status);

    @Modifying
    @Transactional
    @Query("DELETE FROM ExpiryRiskAlert a WHERE a.medicineId = :medicineId")
    void deleteByMedicineId(@Param("medicineId") Long medicineId);
}
