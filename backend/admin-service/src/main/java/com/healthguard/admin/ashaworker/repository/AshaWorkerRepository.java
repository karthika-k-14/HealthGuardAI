package com.healthguard.admin.ashaworker.repository;

import com.healthguard.admin.ashaworker.entity.AshaWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AshaWorkerRepository extends JpaRepository<AshaWorker, Long> {

    Optional<AshaWorker> findByEmail(String email);

    boolean existsByEmail(String email);
}
