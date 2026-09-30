package com.healthguard.community.service.impl;

import com.healthguard.community.dto.ReportResponseDTO;
import com.healthguard.community.entity.AshaFamily;
import com.healthguard.community.entity.AshaFamilyMember;
import com.healthguard.community.entity.DiseaseReport;
import com.healthguard.community.entity.HomeVisit;
import com.healthguard.community.repository.AshaFamilyMemberRepository;
import com.healthguard.community.repository.AshaFamilyRepository;
import com.healthguard.community.repository.DiseaseReportRepository;
import com.healthguard.community.repository.HomeVisitRepository;
import com.healthguard.community.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final DiseaseReportRepository diseaseReportRepository;
    private final AshaFamilyRepository ashaFamilyRepository;
    private final AshaFamilyMemberRepository ashaFamilyMemberRepository;
    private final HomeVisitRepository homeVisitRepository;
    private final JdbcTemplate jdbcTemplate;

    private Long resolveAshaWorkerId(String userEmail, String headerUserId, Long paramAshaWorkerId) {
        if (paramAshaWorkerId != null) {
            return paramAshaWorkerId;
        }

        String email = userEmail;
        if (email == null || email.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                email = auth.getName();
            }
        }

        if (email != null && !email.isBlank()) {
            try {
                List<Long> ids = jdbcTemplate.queryForList(
                        "SELECT id FROM asha_workers WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))",
                        Long.class,
                        email
                );
                if (!ids.isEmpty() && ids.get(0) != null) {
                    return ids.get(0);
                }
            } catch (Exception ignored) {}
        }

        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                Long uId = Long.valueOf(headerUserId);
                List<Long> workerIds = jdbcTemplate.queryForList(
                        "SELECT aw.id FROM asha_workers aw JOIN users u ON LOWER(TRIM(aw.email)) = LOWER(TRIM(u.email)) WHERE u.id = ?",
                        Long.class,
                        uId
                );
                if (!workerIds.isEmpty() && workerIds.get(0) != null) {
                    return workerIds.get(0);
                }
                return uId;
            } catch (Exception ignored) {}
        }

        return null;
    }

    private List<Long> getAssignedCitizenIds(Long ashaWorkerId, String userEmail, String headerUserId) {
        if (ashaWorkerId == null && (userEmail == null || userEmail.isBlank()) && (headerUserId == null || headerUserId.isBlank())) {
            return Collections.emptyList();
        }

        Long uId = null;
        if (headerUserId != null && !headerUserId.isBlank()) {
            try {
                uId = Long.valueOf(headerUserId);
            } catch (Exception ignored) {}
        }

        String workerName = null;
        if (ashaWorkerId != null) {
            try {
                List<String> names = jdbcTemplate.queryForList(
                        "SELECT full_name FROM asha_workers WHERE id = ?",
                        String.class,
                        ashaWorkerId
                );
                if (!names.isEmpty()) {
                    workerName = names.get(0);
                }
            } catch (Exception ignored) {}
        }

        String sql = "SELECT DISTINCT ca.citizen_id FROM citizen_assignment ca WHERE (" +
                "(? IS NOT NULL AND ca.asha_worker_id = ?) OR " +
                "(? IS NOT NULL AND ca.asha_worker_id = ?) OR " +
                "(? IS NOT NULL AND LOWER(TRIM(ca.asha_worker_name)) = LOWER(TRIM(?)))" +
                ") AND (ca.status IS NULL OR UPPER(ca.status) = 'ACTIVE')";

        try {
            return jdbcTemplate.queryForList(
                    sql,
                    Long.class,
                    ashaWorkerId, ashaWorkerId,
                    uId, uId,
                    workerName, workerName
            );
        } catch (Exception e) {
            log.error("Error querying citizen_assignment: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private static class ScopedData {
        Long workerId;
        List<Long> assignedCitizenIds;
        List<AshaFamily> families;
        List<AshaFamilyMember> members;
        List<HomeVisit> visits;
        List<DiseaseReport> diseaseReports;
    }

    private ScopedData loadScopedData(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = new ScopedData();
        boolean isAdminOrOfficer = headerUserRole != null && (
                headerUserRole.equalsIgnoreCase("ADMIN") ||
                headerUserRole.equalsIgnoreCase("ROLE_ADMIN") ||
                headerUserRole.equalsIgnoreCase("HEALTH_OFFICER") ||
                headerUserRole.equalsIgnoreCase("ROLE_HEALTH_OFFICER")
        );

        data.workerId = resolveAshaWorkerId(headerUserEmail, headerUserId, ashaWorkerId);

        if (isAdminOrOfficer && data.workerId == null) {
            data.assignedCitizenIds = Collections.emptyList();
            data.families = ashaFamilyRepository.findAll();
            data.members = ashaFamilyMemberRepository.findAll();
            data.visits = homeVisitRepository.findAll();
            data.diseaseReports = diseaseReportRepository.findAll();
            return data;
        }

        data.assignedCitizenIds = getAssignedCitizenIds(data.workerId, headerUserEmail, headerUserId);
        Set<Long> citizenIdSet = new HashSet<>(data.assignedCitizenIds);

        List<AshaFamily> allFamilies = ashaFamilyRepository.findAll();
        data.families = allFamilies.stream()
                .filter(f -> (data.workerId != null && data.workerId.equals(f.getAshaWorkerId())) ||
                        (f.getCitizenId() != null && citizenIdSet.contains(f.getCitizenId())))
                .collect(Collectors.toList());

        Set<Long> familyIdSet = data.families.stream().map(AshaFamily::getId).collect(Collectors.toSet());

        List<AshaFamilyMember> allMembers = ashaFamilyMemberRepository.findAll();
        data.members = allMembers.stream()
                .filter(m -> m.getFamily() != null && familyIdSet.contains(m.getFamily().getId()))
                .collect(Collectors.toList());

        List<HomeVisit> allVisits = homeVisitRepository.findAll();
        data.visits = allVisits.stream()
                .filter(v -> (data.workerId != null && data.workerId.equals(v.getAshaWorkerId())) ||
                        (v.getCitizenId() != null && citizenIdSet.contains(v.getCitizenId())))
                .collect(Collectors.toList());

        List<DiseaseReport> allDiseaseReports = diseaseReportRepository.findAll();
        data.diseaseReports = allDiseaseReports.stream()
                .filter(r -> (data.workerId != null && data.workerId.equals(r.getAshaWorkerId())) ||
                        (r.getCitizenId() != null && citizenIdSet.contains(r.getCitizenId())))
                .collect(Collectors.toList());

        return data;
    }

    private boolean isSameDate(LocalDate target, LocalDate recordDate, LocalDateTime createdAt) {
        if (recordDate != null && recordDate.equals(target)) return true;
        return createdAt != null && createdAt.toLocalDate().equals(target);
    }

    private boolean isInRange(LocalDate start, LocalDate end, LocalDate recordDate, LocalDateTime createdAt) {
        LocalDate d = recordDate != null ? recordDate : (createdAt != null ? createdAt.toLocalDate() : null);
        if (d == null) return false;
        return !d.isBefore(start) && !d.isAfter(end);
    }

    @Override
    public ReportResponseDTO getDailyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        LocalDate today = LocalDate.now();

        long assignedCitizensCount = data.assignedCitizenIds.size();
        
        List<HomeVisit> todayVisits = data.visits.stream()
                .filter(v -> isSameDate(today, v.getVisitDate(), v.getCreatedAt()))
                .collect(Collectors.toList());

        long visitsCompleted = todayVisits.stream()
                .filter(v -> "COMPLETED".equalsIgnoreCase(v.getStatus()))
                .count();

        long pendingVisits = todayVisits.stream()
                .filter(v -> "SCHEDULED".equalsIgnoreCase(v.getStatus()) || "PENDING".equalsIgnoreCase(v.getStatus()))
                .count();

        List<DiseaseReport> todayDiseaseReports = data.diseaseReports.stream()
                .filter(r -> isSameDate(today, r.getReportDate(), r.getCreatedAt()))
                .collect(Collectors.toList());

        long diseaseReportsCount = todayDiseaseReports.size();

        long childHealthUpdates = data.members.stream()
                .filter(m -> (Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5)))
                .filter(m -> isSameDate(today, null, m.getCreatedAt()) || (m.getUpdatedAt() != null && m.getUpdatedAt().toLocalDate().equals(today)))
                .count();

        long vaccinationsRecorded = data.members.stream()
                .filter(m -> m.getVaccinationStatus() != null && !m.getVaccinationStatus().isBlank())
                .filter(m -> isSameDate(today, null, m.getCreatedAt()) || (m.getUpdatedAt() != null && m.getUpdatedAt().toLocalDate().equals(today)))
                .count();

        long highPriorityCases = todayDiseaseReports.stream()
                .filter(r -> "High".equalsIgnoreCase(r.getSeverity()) || "Critical".equalsIgnoreCase(r.getSeverity()))
                .count() + todayVisits.stream()
                .filter(v -> "High".equalsIgnoreCase(v.getRiskLevel()) || "Critical".equalsIgnoreCase(v.getRiskLevel()))
                .count();

        long emergencyReferrals = todayDiseaseReports.stream()
                .filter(r -> Boolean.TRUE.equals(r.getEmergencyReferral()))
                .count();

        Map<String, Object> todaySummary = new LinkedHashMap<>();
        todaySummary.put("assignedCitizens", assignedCitizensCount);
        todaySummary.put("visitsCompleted", visitsCompleted);
        todaySummary.put("pendingVisits", pendingVisits);
        todaySummary.put("diseaseReports", diseaseReportsCount);
        todaySummary.put("childHealthUpdates", childHealthUpdates);
        todaySummary.put("vaccinations", vaccinationsRecorded);
        todaySummary.put("highPriorityCases", highPriorityCases);
        todaySummary.put("emergencyReferrals", emergencyReferrals);

        Map<String, Object> metrics = new LinkedHashMap<>(todaySummary);

        List<Map<String, Object>> records = new ArrayList<>();
        for (HomeVisit v : todayVisits) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Home Visit");
            row.put("id", v.getVisitId());
            row.put("citizenName", v.getCitizenName());
            row.put("category", v.getVisitType());
            row.put("status", v.getStatus());
            row.put("riskLevel", v.getRiskLevel());
            row.put("date", v.getVisitDate() != null ? v.getVisitDate().toString() : today.toString());
            records.add(row);
        }
        for (DiseaseReport r : todayDiseaseReports) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Disease Report");
            row.put("id", r.getReportId());
            row.put("citizenName", r.getCitizenName());
            row.put("category", r.getDisease());
            row.put("status", r.getStatus());
            row.put("riskLevel", r.getSeverity());
            row.put("date", r.getReportDate() != null ? r.getReportDate().toString() : today.toString());
            records.add(row);
        }

        boolean isEmpty = (assignedCitizensCount == 0 && todayVisits.isEmpty() && todayDiseaseReports.isEmpty() && childHealthUpdates == 0);

        return ReportResponseDTO.builder()
                .reportType("DAILY")
                .reportTitle("Daily ASHA Field Activity Report")
                .reportPeriod("Today (" + today + ")")
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .todayActivitiesSummary(todaySummary)
                .metrics(metrics)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getWeeklyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(7);
        LocalDate prevStart = start.minusDays(7);

        List<HomeVisit> currentVisits = data.visits.stream()
                .filter(v -> isInRange(start, end, v.getVisitDate(), v.getCreatedAt()))
                .collect(Collectors.toList());
        List<HomeVisit> prevVisits = data.visits.stream()
                .filter(v -> isInRange(prevStart, start.minusDays(1), v.getVisitDate(), v.getCreatedAt()))
                .collect(Collectors.toList());

        List<DiseaseReport> currentReports = data.diseaseReports.stream()
                .filter(r -> isInRange(start, end, r.getReportDate(), r.getCreatedAt()))
                .collect(Collectors.toList());
        List<DiseaseReport> prevReports = data.diseaseReports.stream()
                .filter(r -> isInRange(prevStart, start.minusDays(1), r.getReportDate(), r.getCreatedAt()))
                .collect(Collectors.toList());

        long totalVisits = currentVisits.size();
        long totalDiseaseReports = currentReports.size();
        long totalReferrals = currentReports.stream().filter(r -> Boolean.TRUE.equals(r.getEmergencyReferral())).count();

        long totalVaccinations = data.members.stream()
                .filter(m -> m.getVaccinationStatus() != null && !m.getVaccinationStatus().isBlank())
                .filter(m -> isInRange(start, end, null, m.getCreatedAt()) || 
                             (m.getUpdatedAt() != null && !m.getUpdatedAt().toLocalDate().isBefore(start) && !m.getUpdatedAt().toLocalDate().isAfter(end)))
                .count();

        long totalChildHealthRecords = data.members.stream()
                .filter(m -> (Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5)))
                .filter(m -> isInRange(start, end, null, m.getCreatedAt()) || 
                             (m.getUpdatedAt() != null && !m.getUpdatedAt().toLocalDate().isBefore(start) && !m.getUpdatedAt().toLocalDate().isAfter(end)))
                .count();

        double visitsTrendPct = calcTrendPercentage(totalVisits, prevVisits.size());
        double diseaseTrendPct = calcTrendPercentage(totalDiseaseReports, prevReports.size());

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalVisits", totalVisits);
        metrics.put("totalDiseaseReports", totalDiseaseReports);
        metrics.put("totalVaccinations", totalVaccinations);
        metrics.put("totalChildHealthRecords", totalChildHealthRecords);
        metrics.put("totalReferrals", totalReferrals);
        metrics.put("visitsTrendPercentage", visitsTrendPct);
        metrics.put("diseaseTrendPercentage", diseaseTrendPct);

        // Daily time-series trend
        List<Map<String, Object>> timeSeries = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
        for (int i = 6; i >= 0; i--) {
            LocalDate d = end.minusDays(i);
            long dVisits = currentVisits.stream().filter(v -> isSameDate(d, v.getVisitDate(), v.getCreatedAt())).count();
            long dDisease = currentReports.stream().filter(r -> isSameDate(d, r.getReportDate(), r.getCreatedAt())).count();
            Map<String, Object> pt = new HashMap<>();
            pt.put("date", d.format(fmt));
            pt.put("visits", dVisits);
            pt.put("diseaseReports", dDisease);
            timeSeries.add(pt);
        }

        List<Map<String, Object>> records = new ArrayList<>();
        for (HomeVisit v : currentVisits) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Home Visit");
            row.put("id", v.getVisitId());
            row.put("citizenName", v.getCitizenName());
            row.put("category", v.getVisitType());
            row.put("status", v.getStatus());
            row.put("riskLevel", v.getRiskLevel());
            row.put("date", v.getVisitDate() != null ? v.getVisitDate().toString() : "");
            records.add(row);
        }
        for (DiseaseReport r : currentReports) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Disease Report");
            row.put("id", r.getReportId());
            row.put("citizenName", r.getCitizenName());
            row.put("category", r.getDisease());
            row.put("status", r.getStatus());
            row.put("riskLevel", r.getSeverity());
            row.put("date", r.getReportDate() != null ? r.getReportDate().toString() : "");
            records.add(row);
        }

        boolean isEmpty = (totalVisits == 0 && totalDiseaseReports == 0 && totalVaccinations == 0 && totalChildHealthRecords == 0);

        return ReportResponseDTO.builder()
                .reportType("WEEKLY")
                .reportTitle("Weekly ASHA Performance & Surveillance Summary")
                .reportPeriod(start + " to " + end)
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .timeSeriesTrend(timeSeries)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    private double calcTrendPercentage(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return Math.round(((double) (current - previous) / previous * 100.0) * 10.0) / 10.0;
    }

    @Override
    public ReportResponseDTO getMonthlyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        LocalDate end = LocalDate.now();
        LocalDate start = end.withDayOfMonth(1);

        List<HomeVisit> monthVisits = data.visits.stream()
                .filter(v -> isInRange(start, end, v.getVisitDate(), v.getCreatedAt()))
                .collect(Collectors.toList());

        List<DiseaseReport> monthReports = data.diseaseReports.stream()
                .filter(r -> isInRange(start, end, r.getReportDate(), r.getCreatedAt()))
                .collect(Collectors.toList());

        long householdsCovered = monthVisits.stream()
                .map(HomeVisit::getFamilyId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        long citizensVisited = monthVisits.stream()
                .map(HomeVisit::getCitizenId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        Map<String, Long> diseaseDistribution = new LinkedHashMap<>();
        for (DiseaseReport r : monthReports) {
            String dis = r.getDisease();
            if ("Other".equalsIgnoreCase(dis) && r.getOtherDiseaseName() != null && !r.getOtherDiseaseName().isBlank()) {
                dis = r.getOtherDiseaseName().trim();
            }
            if (dis != null && !dis.isBlank()) {
                diseaseDistribution.put(dis, diseaseDistribution.getOrDefault(dis, 0L) + 1);
            }
        }

        long totalMembers = data.members.size();
        long fullyVaccinated = data.members.stream().filter(m -> "UP_TO_DATE".equalsIgnoreCase(m.getVaccinationStatus())).count();
        double coveragePct = totalMembers > 0 ? Math.round(((double) fullyVaccinated / totalMembers * 100.0) * 10.0) / 10.0 : 0.0;

        Map<String, Object> vaccinationCoverage = new LinkedHashMap<>();
        vaccinationCoverage.put("totalMembers", totalMembers);
        vaccinationCoverage.put("fullyVaccinated", fullyVaccinated);
        vaccinationCoverage.put("coveragePercentage", coveragePct);

        long childrenUnder5 = data.members.stream().filter(m -> Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5)).count();
        long childVisits = monthVisits.stream().filter(v -> v.getVisitType() != null && v.getVisitType().toLowerCase().contains("child")).count();
        Map<String, Object> childHealthSummary = new LinkedHashMap<>();
        childHealthSummary.put("childrenUnder5", childrenUnder5);
        childHealthSummary.put("childVisitsConducted", childVisits);

        long highRiskCases = monthReports.stream().filter(r -> "High".equalsIgnoreCase(r.getSeverity()) || "Critical".equalsIgnoreCase(r.getSeverity())).count() +
                monthVisits.stream().filter(v -> "High".equalsIgnoreCase(v.getRiskLevel()) || "Critical".equalsIgnoreCase(v.getRiskLevel())).count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("householdsCovered", householdsCovered);
        metrics.put("citizensVisited", citizensVisited);
        metrics.put("totalDiseaseCases", (long) monthReports.size());
        metrics.put("vaccinationCoveragePct", coveragePct);
        metrics.put("childrenUnder5", childrenUnder5);
        metrics.put("highRiskCases", highRiskCases);

        List<Map<String, Object>> records = new ArrayList<>();
        for (HomeVisit v : monthVisits) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Home Visit");
            row.put("id", v.getVisitId());
            row.put("citizenName", v.getCitizenName());
            row.put("category", v.getVisitType());
            row.put("status", v.getStatus());
            row.put("riskLevel", v.getRiskLevel());
            row.put("date", v.getVisitDate() != null ? v.getVisitDate().toString() : "");
            records.add(row);
        }

        boolean isEmpty = (householdsCovered == 0 && citizensVisited == 0 && monthReports.isEmpty());

        return ReportResponseDTO.builder()
                .reportType("MONTHLY")
                .reportTitle("Monthly Community Health & Surveillance Report")
                .reportPeriod(start + " to " + end)
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .chronicDiseaseDistribution(diseaseDistribution)
                .vaccinationCoverage(vaccinationCoverage)
                .childHealthSummary(childHealthSummary)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getYearlyReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        LocalDate end = LocalDate.now();
        LocalDate start = end.withDayOfYear(1);

        List<HomeVisit> yearVisits = data.visits.stream()
                .filter(v -> isInRange(start, end, v.getVisitDate(), v.getCreatedAt()))
                .collect(Collectors.toList());

        List<DiseaseReport> yearReports = data.diseaseReports.stream()
                .filter(r -> isInRange(start, end, r.getReportDate(), r.getCreatedAt()))
                .collect(Collectors.toList());

        long householdsServed = data.families.size();
        long citizensCovered = data.assignedCitizenIds.size() + data.members.size();
        long totalDiseaseReports = yearReports.size();
        long totalVaccinations = data.members.stream().filter(m -> "UP_TO_DATE".equalsIgnoreCase(m.getVaccinationStatus())).count();
        long totalReferrals = yearReports.stream().filter(r -> Boolean.TRUE.equals(r.getEmergencyReferral())).count();
        long totalChildHealthFollowups = yearVisits.stream()
                .filter(v -> v.getVisitType() != null && v.getVisitType().toLowerCase().contains("child"))
                .count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("householdsServed", householdsServed);
        metrics.put("citizensCovered", citizensCovered);
        metrics.put("totalDiseaseReports", totalDiseaseReports);
        metrics.put("totalVaccinations", totalVaccinations);
        metrics.put("totalReferrals", totalReferrals);
        metrics.put("totalChildHealthFollowups", totalChildHealthFollowups);

        Map<String, Long> monthlyBreakdown = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            final int monthVal = m;
            String mName = LocalDate.of(end.getYear(), monthVal, 1).getMonth().name().substring(0, 3);
            long count = yearReports.stream().filter(r -> {
                LocalDate d = r.getReportDate() != null ? r.getReportDate() : (r.getCreatedAt() != null ? r.getCreatedAt().toLocalDate() : null);
                return d != null && d.getMonthValue() == monthVal;
            }).count() + yearVisits.stream().filter(v -> {
                LocalDate d = v.getVisitDate() != null ? v.getVisitDate() : (v.getCreatedAt() != null ? v.getCreatedAt().toLocalDate() : null);
                return d != null && d.getMonthValue() == monthVal;
            }).count();
            monthlyBreakdown.put(mName, count);
        }

        List<Map<String, Object>> records = new ArrayList<>();
        for (AshaFamily f : data.families) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("type", "Household");
            row.put("id", f.getId());
            row.put("headOfFamily", f.getHeadOfFamily());
            row.put("village", f.getVillage());
            row.put("houseNumber", f.getHouseNumber());
            row.put("riskLevel", f.getRiskLevel());
            records.add(row);
        }

        boolean isEmpty = (householdsServed == 0 && citizensCovered == 0 && yearReports.isEmpty());

        return ReportResponseDTO.builder()
                .reportType("YEARLY")
                .reportTitle("Annual ASHA Health Impact & Public Health Summary")
                .reportPeriod("Year " + end.getYear())
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .monthlyRegistrationBreakdown(monthlyBreakdown)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getDiseaseReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        List<DiseaseReport> reports = data.diseaseReports;

        Map<String, Long> diseaseCases = new LinkedHashMap<>();
        Map<String, Long> severityDist = new LinkedHashMap<>();
        severityDist.put("Low Risk", 0L);
        severityDist.put("Medium Risk", 0L);
        severityDist.put("High Risk", 0L);
        severityDist.put("Critical", 0L);

        Map<String, Long> personTypeDist = new LinkedHashMap<>();
        personTypeDist.put("Head of Household", 0L);
        personTypeDist.put("Spouse", 0L);
        personTypeDist.put("Child", 0L);
        personTypeDist.put("Parent", 0L);
        personTypeDist.put("Other", 0L);

        long pendingReviews = 0;
        long resolvedCases = 0;

        for (DiseaseReport r : reports) {
            String dis = r.getDisease();
            if ("Other".equalsIgnoreCase(dis) && r.getOtherDiseaseName() != null && !r.getOtherDiseaseName().isBlank()) {
                dis = r.getOtherDiseaseName().trim();
            }
            if (dis != null && !dis.isBlank()) {
                diseaseCases.put(dis, diseaseCases.getOrDefault(dis, 0L) + 1);
            }

            String sev = r.getSeverity();
            if (sev != null) {
                if ("Low".equalsIgnoreCase(sev)) severityDist.put("Low Risk", severityDist.get("Low Risk") + 1);
                else if ("Medium".equalsIgnoreCase(sev) || "Moderate".equalsIgnoreCase(sev)) severityDist.put("Medium Risk", severityDist.get("Medium Risk") + 1);
                else if ("High".equalsIgnoreCase(sev)) severityDist.put("High Risk", severityDist.get("High Risk") + 1);
                else if ("Critical".equalsIgnoreCase(sev)) severityDist.put("Critical", severityDist.get("Critical") + 1);
            }

            String rel = r.getRelationship();
            if (rel == null || rel.isBlank()) {
                personTypeDist.put("Head of Household", personTypeDist.get("Head of Household") + 1);
            } else {
                String u = rel.trim().toUpperCase();
                if (u.contains("HEAD") || u.contains("SELF")) personTypeDist.put("Head of Household", personTypeDist.get("Head of Household") + 1);
                else if (u.contains("SPOUSE") || u.contains("WIFE") || u.contains("HUSBAND")) personTypeDist.put("Spouse", personTypeDist.get("Spouse") + 1);
                else if (u.contains("CHILD") || u.contains("SON") || u.contains("DAUGHTER")) personTypeDist.put("Child", personTypeDist.get("Child") + 1);
                else if (u.contains("PARENT") || u.contains("FATHER") || u.contains("MOTHER")) personTypeDist.put("Parent", personTypeDist.get("Parent") + 1);
                else personTypeDist.put("Other", personTypeDist.get("Other") + 1);
            }

            if ("Pending Review".equalsIgnoreCase(r.getStatus()) || "PENDING".equalsIgnoreCase(r.getStatus())) {
                pendingReviews++;
            } else if ("Resolved".equalsIgnoreCase(r.getStatus())) {
                resolvedCases++;
            }
        }

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalCases", (long) reports.size());
        metrics.put("pendingReviews", pendingReviews);
        metrics.put("resolvedCases", resolvedCases);
        metrics.put("criticalCases", severityDist.get("Critical"));
        metrics.put("highRiskCases", severityDist.get("High Risk"));

        List<Map<String, Object>> records = new ArrayList<>();
        for (DiseaseReport r : reports) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("reportId", r.getReportId());
            row.put("citizenName", r.getCitizenName());
            row.put("affectedPerson", r.getAffectedPersonName() != null ? r.getAffectedPersonName() : r.getCitizenName());
            row.put("relationship", r.getRelationship() != null ? r.getRelationship() : "Head of Household");
            row.put("disease", r.getDisease());
            row.put("severity", r.getSeverity());
            row.put("status", r.getStatus());
            row.put("emergencyReferral", Boolean.TRUE.equals(r.getEmergencyReferral()));
            row.put("reportDate", r.getReportDate() != null ? r.getReportDate().toString() : "");
            records.add(row);
        }

        boolean isEmpty = reports.isEmpty();

        return ReportResponseDTO.builder()
                .reportType("DISEASE")
                .reportTitle("Epidemiological & Disease Surveillance Report")
                .reportPeriod("ALL RECORDS")
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .chronicDiseaseDistribution(diseaseCases)
                .severityDistribution(severityDist)
                .affectedPersonTypeDistribution(personTypeDist)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getCitizenReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);

        long totalFamilies = data.families.size();
        long totalMembers = data.members.size();
        long totalCitizens = data.assignedCitizenIds.size() + totalMembers;

        Map<String, Long> genderAnalytics = new LinkedHashMap<>();
        genderAnalytics.put("Male", 0L);
        genderAnalytics.put("Female", 0L);
        genderAnalytics.put("Other", 0L);
        genderAnalytics.put("Not Specified", 0L);

        Map<String, Long> ageGroupAnalytics = new LinkedHashMap<>();
        ageGroupAnalytics.put("0-5", 0L);
        ageGroupAnalytics.put("6-18", 0L);
        ageGroupAnalytics.put("19-40", 0L);
        ageGroupAnalytics.put("41-60", 0L);
        ageGroupAnalytics.put("60+", 0L);

        long pregnantWomen = 0;
        long childrenUnder5 = 0;
        long seniorCitizens = 0;
        long highRiskCitizens = 0;

        for (AshaFamilyMember m : data.members) {
            String g = m.getGender();
            if (g == null || g.isBlank()) genderAnalytics.put("Not Specified", genderAnalytics.get("Not Specified") + 1);
            else if ("Male".equalsIgnoreCase(g)) genderAnalytics.put("Male", genderAnalytics.get("Male") + 1);
            else if ("Female".equalsIgnoreCase(g)) genderAnalytics.put("Female", genderAnalytics.get("Female") + 1);
            else genderAnalytics.put("Other", genderAnalytics.get("Other") + 1);

            int age = m.getAge() != null ? m.getAge() : 0;
            if (age <= 5) ageGroupAnalytics.put("0-5", ageGroupAnalytics.get("0-5") + 1);
            else if (age <= 18) ageGroupAnalytics.put("6-18", ageGroupAnalytics.get("6-18") + 1);
            else if (age <= 40) ageGroupAnalytics.put("19-40", ageGroupAnalytics.get("19-40") + 1);
            else if (age <= 60) ageGroupAnalytics.put("41-60", ageGroupAnalytics.get("41-60") + 1);
            else ageGroupAnalytics.put("60+", ageGroupAnalytics.get("60+") + 1);

            if (Boolean.TRUE.equals(m.getIsPregnant())) pregnantWomen++;
            if (Boolean.TRUE.equals(m.getIsChildMember()) || age <= 5) childrenUnder5++;
            if (age >= 60) seniorCitizens++;
            if ("HIGH_RISK".equalsIgnoreCase(m.getRiskStatus()) || "High".equalsIgnoreCase(m.getRiskStatus())) highRiskCitizens++;
        }

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalCitizens", totalCitizens);
        metrics.put("totalFamilies", totalFamilies);
        metrics.put("totalFamilyMembers", totalMembers);
        metrics.put("pregnantWomen", pregnantWomen);
        metrics.put("childrenUnder5", childrenUnder5);
        metrics.put("seniorCitizens", seniorCitizens);
        metrics.put("highRiskCitizens", highRiskCitizens);

        List<Map<String, Object>> records = new ArrayList<>();
        for (AshaFamilyMember m : data.members) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", m.getId());
            row.put("name", m.getName());
            row.put("relationship", m.getRelationship());
            row.put("age", m.getAge());
            row.put("gender", m.getGender());
            row.put("pregnant", Boolean.TRUE.equals(m.getIsPregnant()));
            row.put("vaccinationStatus", m.getVaccinationStatus());
            row.put("riskStatus", m.getRiskStatus());
            records.add(row);
        }

        boolean isEmpty = (totalCitizens == 0 && totalFamilies == 0);

        return ReportResponseDTO.builder()
                .reportType("CITIZEN")
                .reportTitle("Demographic & Population Health Profile")
                .reportPeriod("ALL CITIZENS")
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .genderAnalytics(genderAnalytics)
                .ageGroupAnalytics(ageGroupAnalytics)
                .genderBreakdown(genderAnalytics)
                .ageGroupBreakdown(ageGroupAnalytics)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getVaccinationReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        List<AshaFamilyMember> members = data.members;

        long totalFamilyMembers = members.size();
        long fullyVaccinated = 0;
        long partiallyVaccinated = 0;
        long notVaccinated = 0;

        long childrenUnder5 = 0;
        long fullyVaccinatedChildren = 0;
        long partiallyVaccinatedChildren = 0;
        long childrenRequiringFollowup = 0;

        for (AshaFamilyMember m : members) {
            String status = m.getVaccinationStatus();
            if (status == null || status.isBlank() || "NOT_VACCINATED".equalsIgnoreCase(status) || "MISSED".equalsIgnoreCase(status)) {
                notVaccinated++;
            } else if ("UP_TO_DATE".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                fullyVaccinated++;
            } else if ("PARTIAL".equalsIgnoreCase(status) || "PENDING".equalsIgnoreCase(status)) {
                partiallyVaccinated++;
            } else {
                notVaccinated++;
            }

            boolean isChild = Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5);
            if (isChild) {
                childrenUnder5++;
                if ("UP_TO_DATE".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
                    fullyVaccinatedChildren++;
                } else if ("PARTIAL".equalsIgnoreCase(status) || "PENDING".equalsIgnoreCase(status)) {
                    partiallyVaccinatedChildren++;
                    childrenRequiringFollowup++;
                } else {
                    childrenRequiringFollowup++;
                }
            }
        }

        double coveragePercentage = totalFamilyMembers > 0 ?
                Math.round(((double) fullyVaccinated / totalFamilyMembers * 100.0) * 10.0) / 10.0 : 0.0;

        double childCoveragePercentage = childrenUnder5 > 0 ?
                Math.round(((double) fullyVaccinatedChildren / childrenUnder5 * 100.0) * 10.0) / 10.0 : 0.0;

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalFamilyMembers", totalFamilyMembers);
        metrics.put("fullyVaccinated", fullyVaccinated);
        metrics.put("partiallyVaccinated", partiallyVaccinated);
        metrics.put("notVaccinated", notVaccinated);
        metrics.put("vaccinationCoveragePercentage", coveragePercentage);
        metrics.put("childrenUnder5", childrenUnder5);
        metrics.put("fullyVaccinatedChildren", fullyVaccinatedChildren);
        metrics.put("partiallyVaccinatedChildren", partiallyVaccinatedChildren);
        metrics.put("childrenRequiringFollowUp", childrenRequiringFollowup);
        metrics.put("childPopulationCoverage", childCoveragePercentage);

        Map<String, Object> coverageMap = new LinkedHashMap<>();
        coverageMap.put("Fully Vaccinated", fullyVaccinated);
        coverageMap.put("Partially Vaccinated", partiallyVaccinated);
        coverageMap.put("Not Vaccinated", notVaccinated);

        List<Map<String, Object>> records = new ArrayList<>();
        for (AshaFamilyMember m : members) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", m.getId());
            row.put("name", m.getName());
            row.put("age", m.getAge());
            row.put("gender", m.getGender());
            row.put("relationship", m.getRelationship());
            row.put("isChildUnder5", Boolean.TRUE.equals(m.getIsChildMember()) || (m.getAge() != null && m.getAge() <= 5));
            row.put("vaccinationStatus", m.getVaccinationStatus() != null ? m.getVaccinationStatus() : "NOT_VACCINATED");
            records.add(row);
        }

        boolean isEmpty = totalFamilyMembers == 0;

        return ReportResponseDTO.builder()
                .reportType("VACCINATION")
                .reportTitle("Immunization & Child Vaccination Coverage Report")
                .reportPeriod("ALL VACCINATION RECORDS")
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .vaccinationCoverage(coverageMap)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }

    @Override
    public ReportResponseDTO getHomeVisitReport(Map<String, String> filters, Long ashaWorkerId, String headerUserId, String headerUserEmail, String headerUserRole) {
        ScopedData data = loadScopedData(filters, ashaWorkerId, headerUserId, headerUserEmail, headerUserRole);
        List<HomeVisit> visits = data.visits;

        long totalVisits = visits.size();
        long completedVisits = visits.stream().filter(v -> "COMPLETED".equalsIgnoreCase(v.getStatus())).count();
        long pendingVisits = visits.stream().filter(v -> "SCHEDULED".equalsIgnoreCase(v.getStatus()) || "PENDING".equalsIgnoreCase(v.getStatus())).count();
        long missedVisits = visits.stream().filter(v -> "MISSED".equalsIgnoreCase(v.getStatus()) || 
                (v.getVisitDate() != null && v.getVisitDate().isBefore(LocalDate.now()) && !"COMPLETED".equalsIgnoreCase(v.getStatus()))).count();

        long pregnancyVisits = visits.stream().filter(v -> (v.getVisitType() != null && v.getVisitType().toLowerCase().contains("pregnan")) ||
                (v.getPregnancyStatus() != null && !v.getPregnancyStatus().isBlank())).count();
        long childHealthVisits = visits.stream().filter(v -> (v.getVisitType() != null && v.getVisitType().toLowerCase().contains("child"))).count();
        long routineVisits = visits.stream().filter(v -> (v.getVisitType() != null && (v.getVisitType().toLowerCase().contains("routine") || v.getVisitType().toLowerCase().contains("general")))).count();
        long emergencyVisits = visits.stream().filter(v -> "High".equalsIgnoreCase(v.getRiskLevel()) || "Critical".equalsIgnoreCase(v.getRiskLevel())).count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalVisitsScheduled", totalVisits);
        metrics.put("completedVisits", completedVisits);
        metrics.put("pendingVisits", pendingVisits);
        metrics.put("missedVisits", missedVisits);
        metrics.put("pregnancyVisits", pregnancyVisits);
        metrics.put("childHealthVisits", childHealthVisits);
        metrics.put("routineVisits", routineVisits);
        metrics.put("emergencyVisits", emergencyVisits);

        Map<String, Long> statusDist = new LinkedHashMap<>();
        statusDist.put("Completed", completedVisits);
        statusDist.put("Pending", pendingVisits);
        statusDist.put("Missed", missedVisits);

        Map<String, Long> typeBreakdown = new LinkedHashMap<>();
        typeBreakdown.put("Pregnancy", pregnancyVisits);
        typeBreakdown.put("Child Health", childHealthVisits);
        typeBreakdown.put("Routine", routineVisits);
        typeBreakdown.put("Emergency", emergencyVisits);

        // Home Visit Trend (by date)
        Map<String, Long> trendMap = new TreeMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (HomeVisit v : visits) {
            LocalDate d = v.getVisitDate() != null ? v.getVisitDate() : (v.getCreatedAt() != null ? v.getCreatedAt().toLocalDate() : null);
            if (d != null) {
                String dStr = d.format(fmt);
                trendMap.put(dStr, trendMap.getOrDefault(dStr, 0L) + 1);
            }
        }
        List<Map<String, Object>> timeSeries = new ArrayList<>();
        trendMap.forEach((dateKey, cnt) -> {
            Map<String, Object> pt = new HashMap<>();
            pt.put("date", dateKey);
            pt.put("visits", cnt);
            timeSeries.add(pt);
        });

        List<Map<String, Object>> records = new ArrayList<>();
        for (HomeVisit v : visits) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("visitId", v.getVisitId());
            row.put("citizenName", v.getCitizenName());
            row.put("village", v.getVillage());
            row.put("visitType", v.getVisitType());
            row.put("visitDate", v.getVisitDate() != null ? v.getVisitDate().toString() : "");
            row.put("status", v.getStatus());
            row.put("riskLevel", v.getRiskLevel());
            records.add(row);
        }

        boolean isEmpty = visits.isEmpty();

        return ReportResponseDTO.builder()
                .reportType("HOME_VISIT")
                .reportTitle("Household Visit Operations & Field Assessment Report")
                .reportPeriod("ALL HOME VISITS")
                .generatedAt(LocalDateTime.now())
                .isEmpty(isEmpty)
                .metrics(metrics)
                .visitStatusDistribution(statusDist)
                .visitTypeBreakdown(typeBreakdown)
                .timeSeriesTrend(timeSeries)
                .records(records)
                .appliedFilters(filters != null ? filters : Collections.emptyMap())
                .build();
    }
}
