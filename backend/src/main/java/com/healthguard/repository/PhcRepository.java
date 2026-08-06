package com.healthguard.repository;

import com.healthguard.entity.Phc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhcRepository extends JpaRepository<Phc, Long> {

    List<Phc> findByVillageId(Long villageId);

    List<Phc> findByDistrict(String district);

    // ---- Health Officer module (Phase 3) -------------------------------

    List<Phc> findByVillageIdIn(List<Long> villageIds);

    long countByVillageIdIn(List<Long> villageIds);
}
