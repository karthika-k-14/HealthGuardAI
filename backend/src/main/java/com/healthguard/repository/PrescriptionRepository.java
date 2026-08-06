package com.healthguard.repository;

import com.healthguard.entity.Prescription;
import com.healthguard.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByStatusOrderByCreatedAtDesc(PrescriptionStatus status);

    List<Prescription> findByOrderByCreatedAtDesc();

    List<Prescription> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    List<Prescription> findByCitizenIdAndStatusOrderByCreatedAtDesc(Long citizenId, PrescriptionStatus status);

    @Query("SELECT p FROM Prescription p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:citizenId IS NULL OR p.citizen.id = :citizenId) AND " +
           "(:search IS NULL OR LOWER(p.patientName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.referredBy) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Prescription> searchPrescriptions(@Param("status") PrescriptionStatus status,
                                           @Param("citizenId") Long citizenId,
                                           @Param("search") String search);

    long countByStatus(PrescriptionStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByStatusAndDispensedAtBetween(PrescriptionStatus status, LocalDateTime start, LocalDateTime end);
}
