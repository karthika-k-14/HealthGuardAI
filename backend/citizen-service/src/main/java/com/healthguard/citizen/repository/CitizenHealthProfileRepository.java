package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.CitizenHealthProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenHealthProfileRepository extends JpaRepository<CitizenHealthProfile, Long> {
    Optional<CitizenHealthProfile> findByCitizenId(Long citizenId);
}
