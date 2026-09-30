package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.DemandAnomalyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface DemandAnomalyAlertRepository extends JpaRepository<DemandAnomalyAlert, Long> {

    List<DemandAnomalyAlert> findTop15ByOrderByCreatedAtDesc();

    Optional<DemandAnomalyAlert> findFirstByMedicineIdOrderByCreatedAtDesc(Long medicineId);

    @Modifying
    @Transactional
    @Query("DELETE FROM DemandAnomalyAlert a WHERE a.medicineId = :medicineId")
    void deleteByMedicineId(@Param("medicineId") Long medicineId);
}
