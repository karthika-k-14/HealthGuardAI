package com.healthguard.admin.admin.repository;

import com.healthguard.admin.admin.entity.AdminBackup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminBackupRepository extends JpaRepository<AdminBackup, Long> {
    Optional<AdminBackup> findTopByOrderByCreatedAtDesc();
}
