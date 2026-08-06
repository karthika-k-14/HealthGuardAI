package com.healthguard.repository;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {

    Optional<Pharmacist> findByEmployeeId(String employeeId);

    Optional<Pharmacist> findByLicenseNumber(String licenseNumber);

    List<Pharmacist> findByAccountStatus(AccountStatus accountStatus);
}
