package com.healthguard.repository;

import com.healthguard.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long> {

    List<Village> findByDistrict(String district);

    List<Village> findByHealthOfficerId(Long healthOfficerId);

    // Used by the read-only admin village listing (GET /admin/villages)
    // that backs the Broadcast Notification "Send to Village" picker.
    List<Village> findAllByOrderByVillageNameAsc();
}
