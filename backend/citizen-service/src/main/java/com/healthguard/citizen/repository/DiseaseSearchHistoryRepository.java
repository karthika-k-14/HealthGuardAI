package com.healthguard.citizen.repository;

import com.healthguard.citizen.entity.DiseaseSearchHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiseaseSearchHistoryRepository extends JpaRepository<DiseaseSearchHistory, Long> {

    List<DiseaseSearchHistory> findByCitizenIdOrderByCreatedAtDesc(Long citizenId, Pageable pageable);

    @Query("SELECT d.diseaseName, COUNT(d) as cnt FROM DiseaseSearchHistory d GROUP BY d.diseaseName ORDER BY COUNT(d) DESC")
    List<Object[]> findTopSearchedDiseases(Pageable pageable);

    @Query("SELECT d.diseaseName FROM DiseaseSearchHistory d WHERE d.citizenId = :citizenId GROUP BY d.diseaseName ORDER BY MAX(d.createdAt) DESC")
    List<String> findDistinctRecentSearchesByCitizenId(@Param("citizenId") Long citizenId, Pageable pageable);
}
