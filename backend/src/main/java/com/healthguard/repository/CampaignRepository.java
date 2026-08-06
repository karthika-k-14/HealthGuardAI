package com.healthguard.repository;

import com.healthguard.entity.Campaign;
import com.healthguard.entity.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findAllByOrderByStartDateDesc();

    // ---- Analytics Module (Phase 12) -----------------------------------

    long countByStatus(CampaignStatus status);

    @Query("SELECT COALESCE(SUM(c.reach), 0) FROM Campaign c")
    long sumTotalReach();

    @Query("SELECT COALESCE(AVG(c.progress), 0.0) FROM Campaign c")
    double avgProgress();

    @Query("SELECT c.type, COUNT(c) FROM Campaign c WHERE c.type IS NOT NULL GROUP BY c.type")
    List<Object[]> countGroupedByType();

    @Query("SELECT c.status, COUNT(c) FROM Campaign c GROUP BY c.status")
    List<Object[]> countGroupedByStatus();
}

