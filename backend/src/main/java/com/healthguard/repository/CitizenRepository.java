package com.healthguard.repository;

import com.healthguard.entity.Citizen;
import com.healthguard.entity.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {

    List<Citizen> findByVillageId(Long villageId);

    long countByVillageId(Long villageId);

    // Used by the ASHA module to look up a single assigned citizen while
    // scoping the lookup to the caller's own village, so one ASHA worker
    // can never view a citizen outside their assignment just by guessing
    // an id.
    Optional<Citizen> findByIdAndVillageId(Long id, Long villageId);

    // ---- Health Officer module (Phase 3) -------------------------------
    // A Health Officer oversees several villages, so these variants take
    // the whole set of village ids under the officer's supervision.

    List<Citizen> findByVillageIdIn(List<Long> villageIds);

    long countByVillageIdIn(List<Long> villageIds);

    // "High risk" is approximated as any citizen with a non-blank chronic
    // disease entry, since the current data model has no dedicated risk
    // score or disease-severity field yet.
    @Query("SELECT COUNT(c) FROM Citizen c WHERE c.village.id IN :villageIds "
            + "AND c.chronicDiseases IS NOT NULL AND TRIM(c.chronicDiseases) <> ''")
    long countHighRiskByVillageIds(@Param("villageIds") List<Long> villageIds);

    // ---- Analytics Module (Phase 12) -----------------------------------

    long countByGender(Gender gender);

    @Query("SELECT COUNT(c) FROM Citizen c WHERE c.age BETWEEN :minAge AND :maxAge")
    long countByAgeBetween(@Param("minAge") Integer minAge, @Param("maxAge") Integer maxAge);

    @Query("SELECT COUNT(c) FROM Citizen c WHERE c.chronicDiseases IS NOT NULL AND TRIM(c.chronicDiseases) <> ''")
    long countWithChronicDiseases();

    @Query("SELECT COUNT(c) FROM Citizen c WHERE c.allergies IS NOT NULL AND TRIM(c.allergies) <> ''")
    long countWithAllergies();

    @Query("SELECT COUNT(c) FROM Citizen c WHERE c.createdAt BETWEEN :start AND :end")
    long countByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT c.chronicDiseases FROM Citizen c WHERE c.chronicDiseases IS NOT NULL AND TRIM(c.chronicDiseases) <> ''")
    List<String> findAllChronicDiseases();
}

