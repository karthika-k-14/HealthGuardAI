package com.healthguard.admin.service;

import java.util.List;
import java.util.Map;

public interface CitizenAssignmentService {

    List<Map<String, Object>> getAllAssignments();

    Map<String, Object> createAssignment(Long citizenId, Long ashaWorkerId, Long adminId, String citizenName, String ashaWorkerName, String village);

    Map<String, Object> reassignCitizen(Long assignmentId, Long ashaWorkerId, String ashaWorkerName);

    Map<String, Object> removeAssignment(Long assignmentId);

    List<Map<String, Object>> getAssignedCitizensForAsha(Long ashaWorkerId);
}
