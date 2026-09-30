package com.healthguard.community.repository;

import com.healthguard.community.entity.ReferralEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<ReferralEntity, Long> {

    List<ReferralEntity> findAllByOrderByCreatedAtDesc();

    List<ReferralEntity> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    Optional<ReferralEntity> findByReferralCode(String referralCode);

    Optional<ReferralEntity> findByReportId(Long reportId);

    @Query("SELECT r FROM ReferralEntity r WHERE " +
            "(:status IS NULL OR :status = 'all' OR LOWER(r.status) = LOWER(:status)) AND " +
            "(:village IS NULL OR :village = 'all' OR LOWER(r.village) = LOWER(:village)) AND " +
            "(:disease IS NULL OR :disease = 'all' OR LOWER(r.disease) = LOWER(:disease)) AND " +
            "(:severity IS NULL OR :severity = 'all' OR LOWER(r.severity) = LOWER(:severity)) AND " +
            "(:search IS NULL OR :search = '' OR " +
            " LOWER(r.patientName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.referralCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.disease) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.village) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.referredPhc) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(r.createdBy) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY r.createdAt DESC")
    List<ReferralEntity> findWithFilters(
            @Param("status") String status,
            @Param("village") String village,
            @Param("disease") String disease,
            @Param("severity") String severity,
            @Param("search") String search
    );

    @Query("SELECT r.village, COUNT(r) FROM ReferralEntity r GROUP BY r.village ORDER BY COUNT(r) DESC")
    List<Object[]> countReferralsByVillage();

    @Query("SELECT r.disease, COUNT(r) FROM ReferralEntity r GROUP BY r.disease ORDER BY COUNT(r) DESC")
    List<Object[]> countReferralsByDisease();

    @Query("SELECT DISTINCT r.village FROM ReferralEntity r ORDER BY r.village ASC")
    List<String> findDistinctVillages();

    @Query("SELECT DISTINCT r.disease FROM ReferralEntity r ORDER BY r.disease ASC")
    List<String> findDistinctDiseases();
}
