package com.healthguard.repository;

import com.healthguard.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByCategoryIgnoreCase(String category);

    List<Medicine> findByManufacturerContainingIgnoreCase(String manufacturer);

    List<Medicine> findByNameContainingIgnoreCase(String name);

    long countByQuantityLessThanEqual(Integer quantity);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.quantity > 0 AND m.quantity <= m.minStockThreshold")
    long countLowStock();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate BETWEEN :start AND :end")
    long countExpiringBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate BETWEEN :start AND :end ORDER BY m.expiryDate ASC")
    List<Medicine> findExpiringBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT m FROM Medicine m WHERE m.quantity > 0 AND m.quantity <= m.minStockThreshold ORDER BY m.quantity ASC")
    List<Medicine> findLowStock();

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= 0 ORDER BY m.name ASC")
    List<Medicine> findOutOfStock();

    @Query("SELECT m FROM Medicine m WHERE "
            + "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "     OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) "
            + "AND (:category IS NULL OR LOWER(m.category) = LOWER(:category)) "
            + "AND (:manufacturer IS NULL OR LOWER(m.manufacturer) LIKE LOWER(CONCAT('%', :manufacturer, '%'))) "
            + "AND (:availability IS NULL "
            + "     OR (:availability = 'IN_STOCK' AND m.quantity > m.minStockThreshold) "
            + "     OR (:availability = 'LOW_STOCK' AND m.quantity > 0 AND m.quantity <= m.minStockThreshold) "
            + "     OR (:availability = 'OUT_OF_STOCK' AND m.quantity <= 0) "
            + "     OR (:availability = 'EXPIRED' AND m.expiryDate < CURRENT_DATE)) "
            + "ORDER BY m.name ASC")
    List<Medicine> search(@Param("search") String search,
                           @Param("category") String category,
                           @Param("manufacturer") String manufacturer,
                           @Param("availability") String availability);

    // ---- Analytics Module (Phase 12) -----------------------------------

    @Query("SELECT COALESCE(SUM(m.quantity), 0) FROM Medicine m")
    long sumTotalQuantity();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.quantity <= 0")
    long countOutOfStockCount();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate < CURRENT_DATE")
    long countExpired();

    @Query("SELECT m.category, COUNT(m) FROM Medicine m WHERE m.category IS NOT NULL GROUP BY m.category")
    List<Object[]> countGroupedByCategory();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

