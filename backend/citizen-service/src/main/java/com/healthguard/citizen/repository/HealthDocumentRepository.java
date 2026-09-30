package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.HealthDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthDocumentRepository extends JpaRepository<HealthDocument, Long> {
    List<HealthDocument> findByCitizenIdOrderByUploadedAtDesc(Long citizenId);
    Page<HealthDocument> findByCitizenIdOrderByUploadedAtDesc(Long citizenId, Pageable pageable);
}

