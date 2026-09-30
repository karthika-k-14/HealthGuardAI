package com.healthguard.community.service;

import com.healthguard.community.dto.*;
import com.healthguard.community.entity.EmergencyAlert;

import java.util.List;

public interface EmergencyAlertService {

    EmergencyAlertDTO createAlert(CreateEmergencyAlertRequest request);

    List<EmergencyAlertDTO> getAlertsForAsha(Long ashaId);

    List<EmergencyAlertDTO> getAlertsForCitizen(Long citizenId);

    List<EmergencyAlertDTO> getAlertsForOfficer();

    EmergencyAlertDTO getAlertById(Long id);

    EmergencyAlertDTO updateStatus(Long id, UpdateEmergencyAlertStatusRequest request);

    EmergencyAlertDTO escalateToOfficer(Long id, EscalateEmergencyAlertRequest request);

    EmergencyAlertDTO resolveAlert(Long id, String notes, String performedBy);

    EmergencyStatisticsDTO getStatistics();

    void autoEscalatePendingAlerts();
}
