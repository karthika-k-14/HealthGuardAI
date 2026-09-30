package com.healthguard.admin.repository;

import com.healthguard.admin.entity.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByStateIgnoreCase(String state);
    Page<Hospital> findByStateIgnoreCase(String state, Pageable pageable);

    List<Hospital> findByDistrictIgnoreCase(String district);
    Page<Hospital> findByDistrictIgnoreCase(String district, Pageable pageable);

    List<Hospital> findByStateIgnoreCaseAndDistrictIgnoreCase(String state, String district);
    Page<Hospital> findByStateIgnoreCaseAndDistrictIgnoreCase(String state, String district, Pageable pageable);

    @Query("SELECT h FROM Hospital h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.district) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.hospitalType) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Hospital> searchHospitals(@Param("query") String query);

    @Query("SELECT h FROM Hospital h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.district) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.hospitalType) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Hospital> searchHospitals(@Param("query") String query, Pageable pageable);
}

