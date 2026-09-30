package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.MedicineReminder;
import com.healthguard.citizen.enums.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineReminderRepository extends JpaRepository<MedicineReminder, Long> {
    List<MedicineReminder> findByCitizenIdOrderByStartDateDesc(Long citizenId);
    List<MedicineReminder> findByCitizenIdInOrderByStartDateDesc(List<Long> citizenIds);
    List<MedicineReminder> findByCitizenIdAndStatus(Long citizenId, ReminderStatus status);
    List<MedicineReminder> findByCitizenIdInAndStatus(List<Long> citizenIds, ReminderStatus status);
}
