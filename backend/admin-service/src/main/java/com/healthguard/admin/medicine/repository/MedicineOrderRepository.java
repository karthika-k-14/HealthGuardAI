package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.MedicineOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicineOrderRepository extends JpaRepository<MedicineOrder, Long>, JpaSpecificationExecutor<MedicineOrder> {

    Optional<MedicineOrder> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    long countByStatus(String status);
}
