package com.healthguard.community.repository;

import com.healthguard.community.entity.PHC;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PHCRepository extends JpaRepository<PHC, Long> {

    Optional<PHC> findByPhcCode(String phcCode);

    boolean existsByPhcCode(String phcCode);

    List<PHC> findByDistrict(String district);
}
