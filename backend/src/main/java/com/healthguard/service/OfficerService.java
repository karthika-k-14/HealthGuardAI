package com.healthguard.service;

import com.healthguard.dto.DiseaseMonitoringResponse;
import com.healthguard.dto.HealthReportResponse;
import com.healthguard.dto.OfficerAshaWorkerResponse;
import com.healthguard.dto.OfficerDashboardResponse;
import com.healthguard.dto.OfficerPhcResponse;
import com.healthguard.dto.OfficerPhcUpdateRequest;
import com.healthguard.dto.OfficerVillageDetailResponse;
import com.healthguard.dto.OfficerVillageResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.AshaWorkerStatus;
import com.healthguard.entity.HealthOfficer;
import com.healthguard.entity.HealthRecord;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Village;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.OfficerMapper;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.HealthRecordRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Business logic for Phase 3 of the Health Officer module: dashboard
 * summary, PHC management, village management, disease monitoring, ASHA
 * monitoring, and health reports.
 * <p>
 * A Health Officer oversees a set of villages ({@code Village.healthOfficer}),
 * so every lookup here is scoped to that set of village ids - one officer
 * can never read a village, PHC, or ASHA worker outside their assignment,
 * not even by guessing an id.
 * <p>
 * Disease Monitoring and Health Reports have no dedicated disease/outbreak
 * or case-workflow entity in the data model yet, so they are deliberately
 * built as best-effort views derived from {@link HealthRecord} - see the
 * javadoc on {@link DiseaseMonitoringResponse} and
 * {@link OfficerDashboardResponse} for what is and isn't backed by real
 * data yet.
 */
@Service
@RequiredArgsConstructor
public class OfficerService {

    private final VillageRepository villageRepository;
    private final PhcRepository phcRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final CitizenRepository citizenRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final OfficerMapper officerMapper;

    // ---- Dashboard -----------------------------------------------------

    public OfficerDashboardResponse getDashboard(HealthOfficer officer) {
        List<Long> villageIds = assignedVillageIds(officer);
        if (villageIds.isEmpty()) {
            return OfficerDashboardResponse.builder()
                    .totalVillages(0).totalPhcs(0).activeAshaWorkers(0).citizensCovered(0)
                    .highRiskPatients(0).pendingCases(0).todaysReports(0).diseaseAlerts(0)
                    .build();
        }
        return OfficerDashboardResponse.builder()
                .totalVillages(villageIds.size())
                .totalPhcs(phcRepository.countByVillageIdIn(villageIds))
                .activeAshaWorkers(ashaWorkerRepository.countByAssignedVillageIdInAndStatus(
                        villageIds, AshaWorkerStatus.ACTIVE))
                .citizensCovered(citizenRepository.countByVillageIdIn(villageIds))
                .highRiskPatients(citizenRepository.countHighRiskByVillageIds(villageIds))
                // No case-workflow entity exists yet to count pending cases from.
                .pendingCases(0)
                .todaysReports(healthRecordRepository.countByVillageIdsAndRecordDate(villageIds, LocalDate.now()))
                // No disease/outbreak entity exists yet to raise alerts from.
                .diseaseAlerts(0)
                .build();
    }

    // ---- PHC management --------------------------------------------------

    public List<OfficerPhcResponse> getPhcs(HealthOfficer officer) {
        List<Long> villageIds = assignedVillageIds(officer);
        if (villageIds.isEmpty()) {
            return Collections.emptyList();
        }
        return phcRepository.findByVillageIdIn(villageIds).stream()
                .map(phc -> officerMapper.toPhcResponse(phc, ashaWorkerRepository.countByAssignedPhcId(phc.getId())))
                .toList();
    }

    public OfficerPhcResponse getPhcDetail(HealthOfficer officer, Long phcId) {
        Phc phc = findAssignedPhc(officer, phcId);
        return officerMapper.toPhcResponse(phc, ashaWorkerRepository.countByAssignedPhcId(phc.getId()));
    }

    @Transactional
    public OfficerPhcResponse updatePhc(HealthOfficer officer, Long phcId, OfficerPhcUpdateRequest request) {
        Phc phc = findAssignedPhc(officer, phcId);
        phc.setName(request.getName());
        phc.setAddress(request.getAddress());
        phc.setDistrict(request.getDistrict());
        phc.setPhone(request.getPhone());
        phc.setLatitude(request.getLatitude());
        phc.setLongitude(request.getLongitude());
        Phc saved = phcRepository.save(phc);
        return officerMapper.toPhcResponse(saved, ashaWorkerRepository.countByAssignedPhcId(saved.getId()));
    }

    // ---- Village management -----------------------------------------------

    public List<OfficerVillageResponse> getVillages(HealthOfficer officer) {
        List<Village> villages = villageRepository.findByHealthOfficerId(officer.getId());
        return villages.stream()
                .map(village -> officerMapper.toVillageResponse(
                        village,
                        citizenRepository.countByVillageId(village.getId()),
                        ashaWorkerRepository.findByAssignedVillageIdIn(List.of(village.getId())).size(),
                        phcRepository.findByVillageId(village.getId()).size()))
                .toList();
    }

    public OfficerVillageDetailResponse getVillageDetail(HealthOfficer officer, Long villageId) {
        Village village = findAssignedVillage(officer, villageId);

        List<AshaWorker> ashaWorkers = ashaWorkerRepository.findByAssignedVillageIdIn(List.of(villageId));
        List<OfficerAshaWorkerResponse> ashaWorkerResponses = ashaWorkers.stream()
                .map(asha -> officerMapper.toAshaWorkerResponse(asha, citizenRepository.countByVillageId(villageId)))
                .toList();

        List<OfficerPhcResponse> phcResponses = phcRepository.findByVillageId(villageId).stream()
                .map(phc -> officerMapper.toPhcResponse(phc, ashaWorkerRepository.countByAssignedPhcId(phc.getId())))
                .toList();

        return officerMapper.toVillageDetailResponse(
                village,
                citizenRepository.countByVillageId(villageId),
                citizenRepository.countHighRiskByVillageIds(List.of(villageId)),
                ashaWorkerResponses,
                phcResponses);
    }

    // ---- Disease monitoring ------------------------------------------------

    public DiseaseMonitoringResponse getDiseaseMonitoring(HealthOfficer officer) {
        List<Long> villageIds = assignedVillageIds(officer);
        if (villageIds.isEmpty()) {
            return DiseaseMonitoringResponse.builder()
                    .totalHealthRecords(0).recordsToday(0).recordsThisWeek(0).recordsThisMonth(0)
                    .byRecordType(Map.of())
                    .byVillage(Collections.emptyList())
                    .outbreakAlerts(Collections.emptyList())
                    .build();
        }

        List<HealthRecord> records = healthRecordRepository.findByVillageIdsOrderByRecordDateDesc(villageIds);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);

        Map<String, Long> byRecordType = records.stream()
                .collect(Collectors.groupingBy(r -> r.getRecordType().name(), LinkedHashMap::new, Collectors.counting()));

        List<Village> villages = villageRepository.findByHealthOfficerId(officer.getId());
        List<DiseaseMonitoringResponse.VillageCaseStat> byVillage = villages.stream()
                .map(village -> DiseaseMonitoringResponse.VillageCaseStat.builder()
                        .villageId(village.getId())
                        .villageName(village.getVillageName())
                        .recordCount(healthRecordRepository.countByVillageIdsAndRecordDateBetween(
                                List.of(village.getId()), LocalDate.of(1900, 1, 1), LocalDate.now()))
                        .build())
                .sorted(Comparator.comparingLong(DiseaseMonitoringResponse.VillageCaseStat::getRecordCount).reversed())
                .toList();

        return DiseaseMonitoringResponse.builder()
                .totalHealthRecords(records.size())
                .recordsToday(healthRecordRepository.countByVillageIdsAndRecordDate(villageIds, today))
                .recordsThisWeek(healthRecordRepository.countByVillageIdsAndRecordDateBetween(villageIds, weekStart, today))
                .recordsThisMonth(healthRecordRepository.countByVillageIdsAndRecordDateBetween(villageIds, monthStart, today))
                .byRecordType(byRecordType)
                .byVillage(byVillage)
                // No outbreak/alert entity exists yet to source this from.
                .outbreakAlerts(Collections.emptyList())
                .build();
    }

    // ---- ASHA monitoring ----------------------------------------------------

    public List<OfficerAshaWorkerResponse> getAshaWorkers(HealthOfficer officer) {
        List<Long> villageIds = assignedVillageIds(officer);
        if (villageIds.isEmpty()) {
            return Collections.emptyList();
        }
        return ashaWorkerRepository.findByAssignedVillageIdIn(villageIds).stream()
                .map(asha -> officerMapper.toAshaWorkerResponse(
                        asha,
                        asha.getAssignedVillage() != null
                                ? citizenRepository.countByVillageId(asha.getAssignedVillage().getId())
                                : 0))
                .toList();
    }

    // ---- Health reports -----------------------------------------------------

    public HealthReportResponse getHealthReport(HealthOfficer officer, String reportType) {
        LocalDate today = LocalDate.now();
        LocalDate periodStart = switch (reportType) {
            case "daily" -> today;
            case "weekly" -> today.minusDays(6);
            case "monthly" -> today.minusDays(29);
            default -> throw new BadRequestException(
                    "Unsupported report type: " + reportType + " (expected daily, weekly, or monthly)");
        };

        List<Long> villageIds = assignedVillageIds(officer);
        long healthRecordsLogged = villageIds.isEmpty() ? 0
                : healthRecordRepository.countByVillageIdsAndRecordDateBetween(villageIds, periodStart, today);

        Map<String, Long> byRecordType = villageIds.isEmpty() ? Map.of()
                : healthRecordRepository.findByVillageIdsOrderByRecordDateDesc(villageIds).stream()
                        .filter(r -> !r.getRecordDate().isBefore(periodStart) && !r.getRecordDate().isAfter(today))
                        .collect(Collectors.groupingBy(r -> r.getRecordType().name(), LinkedHashMap::new, Collectors.counting()));

        return HealthReportResponse.builder()
                .reportType(reportType)
                .generatedAt(java.time.LocalDateTime.now())
                .periodStart(periodStart)
                .periodEnd(today)
                .villagesCovered(villageIds.size())
                .phcsCovered(villageIds.isEmpty() ? 0 : phcRepository.countByVillageIdIn(villageIds))
                .activeAshaWorkers(villageIds.isEmpty() ? 0
                        : ashaWorkerRepository.countByAssignedVillageIdInAndStatus(villageIds, AshaWorkerStatus.ACTIVE))
                .citizensCovered(villageIds.isEmpty() ? 0 : citizenRepository.countByVillageIdIn(villageIds))
                .healthRecordsLogged(healthRecordsLogged)
                .byRecordType(byRecordType)
                .build();
    }

    /**
     * Renders a health report as CSV bytes for {@code GET /officer/reports/{reportType}/export}.
     */
    public byte[] exportHealthReport(HealthOfficer officer, String reportType) {
        HealthReportResponse report = getHealthReport(officer, reportType);
        StringBuilder csv = new StringBuilder();
        csv.append("Metric,Value\n");
        csv.append("Report Type,").append(report.getReportType()).append("\n");
        csv.append("Generated At,").append(report.getGeneratedAt()).append("\n");
        csv.append("Period Start,").append(report.getPeriodStart()).append("\n");
        csv.append("Period End,").append(report.getPeriodEnd()).append("\n");
        csv.append("Villages Covered,").append(report.getVillagesCovered()).append("\n");
        csv.append("PHCs Covered,").append(report.getPhcsCovered()).append("\n");
        csv.append("Active ASHA Workers,").append(report.getActiveAshaWorkers()).append("\n");
        csv.append("Citizens Covered,").append(report.getCitizensCovered()).append("\n");
        csv.append("Health Records Logged,").append(report.getHealthRecordsLogged()).append("\n");
        report.getByRecordType().forEach((type, count) ->
                csv.append("Records - ").append(type).append(",").append(count).append("\n"));
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    // ---- Helpers -----------------------------------------------------

    private List<Long> assignedVillageIds(HealthOfficer officer) {
        return villageRepository.findByHealthOfficerId(officer.getId()).stream()
                .map(Village::getId)
                .toList();
    }

    /**
     * Looks up a PHC by id, but only if it sits in a village supervised by
     * the calling officer. An officer with no assigned villages can never
     * have an assigned PHC.
     */
    private Phc findAssignedPhc(HealthOfficer officer, Long phcId) {
        List<Long> villageIds = assignedVillageIds(officer);
        return phcRepository.findByVillageIdIn(villageIds).stream()
                .filter(phc -> phc.getId().equals(phcId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found: " + phcId));
    }

    /**
     * Looks up a village by id, but only if it is supervised by the calling
     * officer.
     */
    private Village findAssignedVillage(HealthOfficer officer, Long villageId) {
        return villageRepository.findByHealthOfficerId(officer.getId()).stream()
                .filter(village -> village.getId().equals(villageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Village not found: " + villageId));
    }
}
