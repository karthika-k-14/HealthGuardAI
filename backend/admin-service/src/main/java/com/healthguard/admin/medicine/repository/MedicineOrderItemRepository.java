package com.healthguard.admin.medicine.repository;

import com.healthguard.admin.medicine.entity.MedicineOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineOrderItemRepository extends JpaRepository<MedicineOrderItem, Long> {

    List<MedicineOrderItem> findByOrderId(Long orderId);
}
