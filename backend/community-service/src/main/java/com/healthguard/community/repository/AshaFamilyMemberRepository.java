package com.healthguard.community.repository;

import com.healthguard.community.entity.AshaFamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AshaFamilyMemberRepository extends JpaRepository<AshaFamilyMember, Long> {
    @Query("SELECT m FROM AshaFamilyMember m WHERE m.family.id = :familyId")
    List<AshaFamilyMember> findByFamilyId(@Param("familyId") Long familyId);

    List<AshaFamilyMember> findByIsPregnantTrue();
    List<AshaFamilyMember> findByIsChildMemberOrAgeLessThanEqual(Boolean isChildMember, Integer age);
}
