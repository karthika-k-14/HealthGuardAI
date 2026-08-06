package com.healthguard.repository;

import com.healthguard.entity.StockMovementType;
import com.healthguard.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByMedicineIdOrderByTransactionDateDesc(Long medicineId);

    List<StockTransaction> findByOrderByTransactionDateDesc();

    List<StockTransaction> findByMovementTypeOrderByTransactionDateDesc(StockMovementType movementType);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM StockTransaction t WHERE t.movementType = :type "
            + "AND t.transactionDate BETWEEN :start AND :end")
    long sumQuantityByTypeAndDateBetween(@Param("type") StockMovementType type,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @Query("SELECT t.medicine.name, SUM(t.quantity) FROM StockTransaction t WHERE t.movementType = :type "
            + "AND t.transactionDate BETWEEN :start AND :end GROUP BY t.medicine.name ORDER BY SUM(t.quantity) DESC")
    List<Object[]> sumQuantityByMedicineNameForTypeAndDateBetween(@Param("type") StockMovementType type,
                                                                   @Param("start") LocalDateTime start,
                                                                   @Param("end") LocalDateTime end);
}
