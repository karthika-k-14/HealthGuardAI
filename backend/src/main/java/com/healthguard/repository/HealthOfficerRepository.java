package com.healthguard.repository;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.HealthOfficer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthOfficerRepository extends JpaRepository<HealthOfficer, Long> {

    Optional<HealthOfficer> findByEmployeeId(String employeeId);

    List<HealthOfficer> findByAccountStatus(AccountStatus accountStatus);
}
