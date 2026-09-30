package com.healthguard.community.repository;

import com.healthguard.community.entity.OutbreakAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutbreakAlertRepository extends JpaRepository<OutbreakAlert, Long> {
    List<OutbreakAlert> findByStatus(String status);
}
