package com.healthguard.repository;

import com.healthguard.entity.Workflow;
import com.healthguard.entity.WorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    List<Workflow> findByStatus(WorkflowStatus status);

    List<Workflow> findByStatusIn(List<WorkflowStatus> statuses);

    List<Workflow> findByReferralId(Long referralId);

    List<Workflow> findByAssignedTo(String assignedTo);

    List<Workflow> findByCitizenId(Long citizenId);

    Optional<Workflow> findByCaseNumber(String caseNumber);

    long countByStatus(WorkflowStatus status);
}
