package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {

    @Query("SELECT f FROM FamilyMember f WHERE f.userId = :userId")
    List<FamilyMember> findByUserId(@Param("userId") Long userId);
}
