package com.healthguard.repository;

import com.healthguard.entity.SosRequest;
import com.healthguard.entity.SosStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SosRequestRepository extends JpaRepository<SosRequest, Long> {

    List<SosRequest> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    Optional<SosRequest> findByIdAndCitizenId(Long id, Long citizenId);

    List<SosRequest> findAllByOrderByCreatedAtDesc();

    List<SosRequest> findByStatusNotOrderByCreatedAtDesc(SosStatus status);
}
