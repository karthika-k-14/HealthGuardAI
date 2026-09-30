package com.healthguard.community.repository;

import com.healthguard.community.entity.HealthOfficerSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthOfficerSettingsRepository extends JpaRepository<HealthOfficerSettings, Long> {

    Optional<HealthOfficerSettings> findFirstByUserId(String userId);

    Optional<HealthOfficerSettings> findFirstByUserEmail(String userEmail);

    Optional<HealthOfficerSettings> findFirstByOrderByIdAsc();
}
