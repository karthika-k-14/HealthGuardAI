package com.healthguard.repository;

import com.healthguard.entity.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findByCitizenIdOrderByIsPrimaryDescCreatedAtAsc(Long citizenId);

    Optional<EmergencyContact> findByIdAndCitizenId(Long id, Long citizenId);

    @Query("SELECT ec FROM EmergencyContact ec WHERE ec.citizen.id = :citizenId AND ("
            + "LOWER(ec.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(ec.relationship) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR ec.phone LIKE CONCAT('%', :keyword, '%')) "
            + "ORDER BY ec.isPrimary DESC, ec.createdAt ASC")
    List<EmergencyContact> search(@Param("citizenId") Long citizenId, @Param("keyword") String keyword);
}
