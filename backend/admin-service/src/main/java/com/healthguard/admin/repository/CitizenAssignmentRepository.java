package com.healthguard.admin.repository;

import com.healthguard.admin.entity.CitizenAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CitizenAssignmentRepository extends JpaRepository<CitizenAssignment, Long> {

    Optional<CitizenAssignment> findByCitizenId(Long citizenId);

    List<CitizenAssignment> findAllByCitizenId(Long citizenId);

    List<CitizenAssignment> findByAshaWorkerId(Long ashaWorkerId);

    List<CitizenAssignment> findByStatus(String status);

    boolean existsByCitizenId(Long citizenId);
}
