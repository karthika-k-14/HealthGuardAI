package com.healthguard.community.repository;

import com.healthguard.community.entity.ASHAWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ASHAWorkerRepository extends JpaRepository<ASHAWorker, Long> {

    Optional<ASHAWorker> findByWorkerId(String workerId);

    Optional<ASHAWorker> findByEmail(String email);

    boolean existsByWorkerId(String workerId);

    boolean existsByEmail(String email);

    List<ASHAWorker> findByDistrict(String district);
}
