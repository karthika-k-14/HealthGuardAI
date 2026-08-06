package com.healthguard.repository;

import com.healthguard.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, Long> {

    List<Referral> findByStatus(String status);

    List<Referral> findByToFacility(String toFacility);
}
