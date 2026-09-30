package com.healthguard.community.repository;

import com.healthguard.community.entity.HealthOfficerPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthOfficerPreferencesRepository extends JpaRepository<HealthOfficerPreferences, Long> {
    Optional<HealthOfficerPreferences> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
