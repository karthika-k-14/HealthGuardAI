package com.healthguard.community.repository;

import com.healthguard.community.entity.PhcAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhcAlertRepository extends JpaRepository<PhcAlert, Long> {
    List<PhcAlert> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
