package com.healthguard.admin.healthofficer.repository;

import com.healthguard.admin.healthofficer.entity.HealthOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HealthOfficerRepository extends JpaRepository<HealthOfficer, Long> {

    Optional<HealthOfficer> findByOfficerId(String officerId);

    Optional<HealthOfficer> findByEmail(String email);

    boolean existsByOfficerId(String officerId);

    boolean existsByEmail(String email);
}
