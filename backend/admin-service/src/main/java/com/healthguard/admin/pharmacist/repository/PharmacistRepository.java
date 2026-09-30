package com.healthguard.admin.pharmacist.repository;

import com.healthguard.admin.pharmacist.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {

    Optional<Pharmacist> findByPharmacistId(String pharmacistId);

    Optional<Pharmacist> findByEmail(String email);

    boolean existsByPharmacistId(String pharmacistId);

    boolean existsByEmail(String email);
}
