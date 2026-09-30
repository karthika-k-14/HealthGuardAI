package com.healthguard.community.repository;

import com.healthguard.community.entity.ReferralStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralStatusHistoryRepository extends JpaRepository<ReferralStatusHistory, Long> {

    List<ReferralStatusHistory> findByReferralIdOrderByCreatedAtDesc(Long referralId);

    List<ReferralStatusHistory> findByReferralIdOrderByCreatedAtAsc(Long referralId);
}
