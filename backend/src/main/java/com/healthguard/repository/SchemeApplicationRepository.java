package com.healthguard.repository;

import com.healthguard.entity.SchemeApplication;
import com.healthguard.entity.SchemeApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchemeApplicationRepository extends JpaRepository<SchemeApplication, Long> {

    List<SchemeApplication> findByStatus(SchemeApplicationStatus status);

    List<SchemeApplication> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    Optional<SchemeApplication> findByCitizenIdAndSchemeIdAndStatusIn(
            Long citizenId, Long schemeId, List<SchemeApplicationStatus> statuses);
}
