package com.healthguard.repository;

import com.healthguard.entity.AccountStatus;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.AshaWorkerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AshaWorkerRepository extends JpaRepository<AshaWorker, Long> {

    Optional<AshaWorker> findByEmployeeId(String employeeId);

    List<AshaWorker> findByAccountStatus(AccountStatus accountStatus);

    List<AshaWorker> findByAssignedVillageId(Long villageId);

    // Written as an explicit JPQL query (rather than a derived method name)
    // because the "PHC" acronym casing in assignedPHC can be ambiguous for
    // Spring Data's automatic property-path parser.
    @Query("SELECT a FROM AshaWorker a WHERE a.assignedPHC.id = :phcId")
    List<AshaWorker> findByAssignedPhcId(@Param("phcId") Long phcId);

    @Query("SELECT COUNT(a) FROM AshaWorker a WHERE a.assignedPHC.id = :phcId")
    long countByAssignedPhcId(@Param("phcId") Long phcId);

    // ---- Health Officer module (Phase 3) -------------------------------
    // A Health Officer oversees several villages at once, so ASHA
    // monitoring is scoped to the whole set of village ids under them.

    List<AshaWorker> findByAssignedVillageIdIn(List<Long> villageIds);

    long countByAssignedVillageIdInAndStatus(List<Long> villageIds, AshaWorkerStatus status);
}
