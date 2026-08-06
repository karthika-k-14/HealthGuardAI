package com.healthguard.repository;

import com.healthguard.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    List<FamilyMember> findByCitizenIdOrderByCreatedAtAsc(Long citizenId);

    Optional<FamilyMember> findByIdAndCitizenId(Long id, Long citizenId);
}
