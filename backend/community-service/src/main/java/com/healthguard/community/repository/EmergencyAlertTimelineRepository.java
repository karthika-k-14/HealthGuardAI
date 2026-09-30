package com.healthguard.community.repository;

import com.healthguard.community.entity.EmergencyAlertTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertTimelineRepository extends JpaRepository<EmergencyAlertTimeline, Long> {

    List<EmergencyAlertTimeline> findByAlertIdOrderByTimestampAsc(Long alertId);
}
