package com.healthguard.ai.service;

import com.healthguard.ai.dto.TriageRequest;
import com.healthguard.ai.dto.TriageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TriageService {

    TriageResponse evaluateTriage(TriageRequest request);

    TriageResponse getSessionByUuid(String sessionUuid, Long requesterUserId);

    Page<TriageResponse> getTriageHistoryByUserId(Long userId, Pageable pageable);

    Page<TriageResponse> getEmergencyAlertSessions(Pageable pageable);

    Page<TriageResponse> searchSessions(String keyword, Pageable pageable);

    void deleteSession(String sessionUuid, Long requesterUserId);
}

