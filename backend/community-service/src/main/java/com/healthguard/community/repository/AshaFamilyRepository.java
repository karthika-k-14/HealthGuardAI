package com.healthguard.community.repository;

import com.healthguard.community.entity.AshaFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AshaFamilyRepository extends JpaRepository<AshaFamily, Long> {
    Optional<AshaFamily> findByCitizenId(Long citizenId);
    List<AshaFamily> findAllByCitizenId(Long citizenId);
    List<AshaFamily> findByAshaWorkerId(Long ashaWorkerId);
    List<AshaFamily> findByCitizenIdIn(Collection<Long> citizenIds);
}
