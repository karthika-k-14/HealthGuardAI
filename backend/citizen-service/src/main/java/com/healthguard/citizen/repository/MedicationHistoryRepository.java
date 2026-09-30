package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.MedicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicationHistoryRepository extends JpaRepository<MedicationHistory, Long> {

    List<MedicationHistory> findByCitizenId(Long citizenId);

    List<MedicationHistory> findByCitizenIdIn(List<Long> citizenIds);

    Optional<MedicationHistory> findFirstByReminderIdAndDate(Long reminderId, LocalDate date);

    boolean existsByReminderIdAndDate(Long reminderId, LocalDate date);

    long countByCitizenIdAndStatus(Long citizenId, String status);

    long countByCitizenIdInAndStatus(List<Long> citizenIds, String status);
}
