package com.healthguard.admin.pharmacist.repository;

import com.healthguard.admin.pharmacist.entity.PharmacistSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PharmacistSettingsRepository extends JpaRepository<PharmacistSettings, Long> {

    Optional<PharmacistSettings> findByEmail(String email);

    Optional<PharmacistSettings> findByPharmacistId(String pharmacistId);
}
