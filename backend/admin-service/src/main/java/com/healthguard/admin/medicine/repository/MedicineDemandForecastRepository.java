package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineDemandForecastRepository extends JpaRepository<MedicineDemandForecast, Long> {

    Optional<MedicineDemandForecast> findByMedicineId(Long medicineId);

    Optional<MedicineDemandForecast> findFirstByMedicineNameOrderByGeneratedAtDesc(String medicineName);

    Optional<MedicineDemandForecast> findFirstByMedicineIdOrderByGeneratedAtDesc(Long medicineId);

    @Modifying
    @Transactional
    @Query("DELETE FROM MedicineDemandForecast f WHERE f.medicineId = :medicineId")
    void deleteByMedicineId(@Param("medicineId") Long medicineId);

    @Modifying
    @Transactional
    @Query("DELETE FROM MedicineDemandForecast f WHERE f.medicineName = :medicineName")
    void deleteByMedicineName(@Param("medicineName") String medicineName);

    List<MedicineDemandForecast> findAllByOrderByPredictedDemandDesc();

    List<MedicineDemandForecast> findTop10ByOrderByPredictedDemandDesc();

    List<MedicineDemandForecast> findByRecommendedOrderGreaterThanOrderByRecommendedOrderDesc(Integer minOrder);

    @Query("SELECT f FROM MedicineDemandForecast f WHERE UPPER(f.riskLevel) = 'CRITICAL' OR f.estimatedDaysOfStockRemaining < :days ORDER BY f.estimatedDaysOfStockRemaining ASC")
    List<MedicineDemandForecast> findLowStockRiskForecasts(@Param("days") Integer days);

    @Query("SELECT f FROM MedicineDemandForecast f WHERE UPPER(f.riskLevel) = 'CRITICAL' OR (f.estimatedDaysOfStockRemaining IS NOT NULL AND f.estimatedDaysOfStockRemaining < 15) ORDER BY f.estimatedDaysOfStockRemaining ASC")
    List<MedicineDemandForecast> findLowStockAlerts();

    @Query(value = "SELECT DISTINCT ON (medicine_name) * FROM medicine_demand_forecasts ORDER BY medicine_name, generated_at DESC", nativeQuery = true)
    List<MedicineDemandForecast> findLatestForecasts();

    @Query(value = "SELECT DISTINCT ON (medicine_name) * FROM medicine_demand_forecasts ORDER BY medicine_name, generated_at DESC LIMIT 10", nativeQuery = true)
    List<MedicineDemandForecast> findTopNeededMedicines();
}
