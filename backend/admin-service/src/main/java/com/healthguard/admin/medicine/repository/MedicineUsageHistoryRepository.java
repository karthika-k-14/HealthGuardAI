package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.MedicineUsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineUsageHistoryRepository extends JpaRepository<MedicineUsageHistory, Long> {

    List<MedicineUsageHistory> findByMedicineNameOrderByUsageDateDesc(String medicineName);

    List<MedicineUsageHistory> findByVillage(String village);

    List<MedicineUsageHistory> findByUsageDateAfter(LocalDate date);

    @Query("SELECT COALESCE(SUM(u.quantityUsed), 0) FROM MedicineUsageHistory u WHERE u.medicineName = :medicineName AND u.usageDate >= :since")
    Integer sumUsageSince(String medicineName, LocalDate since);
}
