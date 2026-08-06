package com.healthguard.service;

import com.healthguard.dto.CampaignReportResponse;
import com.healthguard.dto.CitizenReportResponse;
import com.healthguard.dto.DailyReportResponse;
import com.healthguard.dto.DiseaseReportResponse;
import com.healthguard.dto.HospitalReportResponse;
import com.healthguard.dto.MedicineReportResponse;
import com.healthguard.dto.MonthlyReportResponse;
import com.healthguard.dto.PhcReportResponse;
import com.healthguard.dto.ReportFilterRequest;
import com.healthguard.dto.WeeklyReportResponse;
import com.healthguard.dto.YearlyReportResponse;
import com.healthguard.entity.AshaWorker;
import com.healthguard.entity.Campaign;
import com.healthguard.entity.CampaignStatus;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.HealthRecord;
import com.healthguard.entity.Hospital;
import com.healthguard.entity.Medicine;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.entity.SosRequest;
import com.healthguard.entity.Village;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.CampaignRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.HealthOfficerRepository;
import com.healthguard.repository.HealthRecordRepository;
import com.healthguard.repository.HospitalRepository;
import com.healthguard.repository.MedicineRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.PrescriptionRepository;
import com.healthguard.repository.SosRequestRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for generating comprehensive periodic and domain-specific reports.
 * Supports multi-criteria filtering by Date, Village, PHC, Hospital, District, Health Officer, and ASHA Worker.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final AnalyticsService analyticsService;
    private final CitizenRepository citizenRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final HealthOfficerRepository healthOfficerRepository;
    private final HospitalRepository hospitalRepository;
    private final PhcRepository phcRepository;
    private final VillageRepository villageRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final CampaignRepository campaignRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final SosRequestRepository sosRequestRepository;

    public DailyReportResponse getDailyReport(ReportFilterRequest filter) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = filter.getDate() != null ? filter.getDate().atStartOfDay()
                : (filter.getStartDate() != null ? filter.getStartDate() : now.with(LocalTime.MIN));
        LocalDateTime end = filter.getDate() != null ? filter.getDate().atTime(LocalTime.MAX)
                : (filter.getEndDate() != null ? filter.getEndDate() : now.with(LocalTime.MAX));

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);
        List<HealthRecord> filteredRecords = filterHealthRecords(healthRecordRepository.findAll(), filter, start, end);
        List<Prescription> filteredPrescriptions = filterPrescriptions(prescriptionRepository.findAll(), filter, start, end);
        List<Campaign> filteredCampaigns = filterCampaigns(campaignRepository.findAll(), filter, start, end);
        List<Medicine> filteredMedicines = filterMedicines(medicineRepository.findAll(), filter, start, end);
        List<SosRequest> filteredSos = filterSosRequests(sosRequestRepository.findAll(), filter, start, end);

        long newCitizens = filteredCitizens.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(start) && !c.getCreatedAt().isAfter(end))
                .count();
        long newRecords = filteredRecords.stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(start) && !r.getCreatedAt().isAfter(end))
                .count();
        long createdPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(start) && !p.getCreatedAt().isAfter(end))
                .count();
        long dispensedPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.DISPENSED &&
                        p.getDispensedAt() != null && !p.getDispensedAt().isBefore(start) && !p.getDispensedAt().isAfter(end))
                .count();
        long activeCampaigns = filteredCampaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long newMedicines = filteredMedicines.stream()
                .filter(m -> m.getCreatedAt() != null && !m.getCreatedAt().isBefore(start) && !m.getCreatedAt().isAfter(end))
                .count();
        long sosCount = filteredSos.size();

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalFilteredCitizens", filteredCitizens.size());
        overview.put("totalFilteredHealthRecords", filteredRecords.size());
        overview.put("totalFilteredPrescriptions", filteredPrescriptions.size());

        return DailyReportResponse.builder()
                .reportTitle("Daily Activity & Health Summary Report")
                .reportPeriod("DAILY")
                .generatedAt(LocalDateTime.now())
                .startDate(start)
                .endDate(end)
                .appliedFilters(extractAppliedFilters(filter))
                .newCitizensRegistered(newCitizens)
                .newHealthRecordsCreated(newRecords)
                .prescriptionsCreated(createdPrescriptions)
                .prescriptionsDispensed(dispensedPrescriptions)
                .activeCampaigns(activeCampaigns)
                .newMedicinesAdded(newMedicines)
                .sosRequestsCount(sosCount)
                .summaryOverview(overview)
                .build();
    }

    public WeeklyReportResponse getWeeklyReport(ReportFilterRequest filter) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : now.minusDays(7).with(LocalTime.MIN);
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : now.with(LocalTime.MAX);

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);
        List<HealthRecord> filteredRecords = filterHealthRecords(healthRecordRepository.findAll(), filter, start, end);
        List<Prescription> filteredPrescriptions = filterPrescriptions(prescriptionRepository.findAll(), filter, start, end);
        List<Campaign> filteredCampaigns = filterCampaigns(campaignRepository.findAll(), filter, start, end);
        List<Medicine> filteredMedicines = filterMedicines(medicineRepository.findAll(), filter, start, end);
        List<SosRequest> filteredSos = filterSosRequests(sosRequestRepository.findAll(), filter, start, end);

        long newCitizens = filteredCitizens.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(start) && !c.getCreatedAt().isAfter(end))
                .count();
        long newRecords = filteredRecords.stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(start) && !r.getCreatedAt().isAfter(end))
                .count();
        long createdPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(start) && !p.getCreatedAt().isAfter(end))
                .count();
        long dispensedPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.DISPENSED &&
                        p.getDispensedAt() != null && !p.getDispensedAt().isBefore(start) && !p.getDispensedAt().isAfter(end))
                .count();
        long activeCampaigns = filteredCampaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long newMedicines = filteredMedicines.stream()
                .filter(m -> m.getCreatedAt() != null && !m.getCreatedAt().isBefore(start) && !m.getCreatedAt().isAfter(end))
                .count();

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalFilteredCitizens", filteredCitizens.size());
        overview.put("totalFilteredHealthRecords", filteredRecords.size());

        return WeeklyReportResponse.builder()
                .reportTitle("Weekly Health & Operational Performance Report")
                .reportPeriod("WEEKLY")
                .generatedAt(LocalDateTime.now())
                .startDate(start)
                .endDate(end)
                .appliedFilters(extractAppliedFilters(filter))
                .newCitizensRegistered(newCitizens)
                .newHealthRecordsCreated(newRecords)
                .prescriptionsCreated(createdPrescriptions)
                .prescriptionsDispensed(dispensedPrescriptions)
                .activeCampaigns(activeCampaigns)
                .newMedicinesAdded(newMedicines)
                .sosRequestsCount(filteredSos.size())
                .summaryOverview(overview)
                .build();
    }

    public MonthlyReportResponse getMonthlyReport(ReportFilterRequest filter) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : now.with(LocalTime.MAX);

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);
        List<HealthRecord> filteredRecords = filterHealthRecords(healthRecordRepository.findAll(), filter, start, end);
        List<Prescription> filteredPrescriptions = filterPrescriptions(prescriptionRepository.findAll(), filter, start, end);
        List<Campaign> filteredCampaigns = filterCampaigns(campaignRepository.findAll(), filter, start, end);
        List<Medicine> filteredMedicines = filterMedicines(medicineRepository.findAll(), filter, start, end);
        List<SosRequest> filteredSos = filterSosRequests(sosRequestRepository.findAll(), filter, start, end);

        long newCitizens = filteredCitizens.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(start) && !c.getCreatedAt().isAfter(end))
                .count();
        long newRecords = filteredRecords.stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(start) && !r.getCreatedAt().isAfter(end))
                .count();
        long createdPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(start) && !p.getCreatedAt().isAfter(end))
                .count();
        long dispensedPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.DISPENSED &&
                        p.getDispensedAt() != null && !p.getDispensedAt().isBefore(start) && !p.getDispensedAt().isAfter(end))
                .count();
        long activeCampaigns = filteredCampaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long newMedicines = filteredMedicines.stream()
                .filter(m -> m.getCreatedAt() != null && !m.getCreatedAt().isBefore(start) && !m.getCreatedAt().isAfter(end))
                .count();

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalFilteredCitizens", filteredCitizens.size());
        overview.put("totalFilteredHealthRecords", filteredRecords.size());

        return MonthlyReportResponse.builder()
                .reportTitle("Monthly Comprehensive Health Analytics Report")
                .reportPeriod("MONTHLY")
                .generatedAt(LocalDateTime.now())
                .startDate(start)
                .endDate(end)
                .appliedFilters(extractAppliedFilters(filter))
                .newCitizensRegistered(newCitizens)
                .newHealthRecordsCreated(newRecords)
                .prescriptionsCreated(createdPrescriptions)
                .prescriptionsDispensed(dispensedPrescriptions)
                .activeCampaigns(activeCampaigns)
                .newMedicinesAdded(newMedicines)
                .sosRequestsCount(filteredSos.size())
                .summaryOverview(overview)
                .build();
    }

    public YearlyReportResponse getYearlyReport(ReportFilterRequest filter) {
        int year = filter.getYear() != null ? filter.getYear() : LocalDateTime.now().getYear();
        LocalDateTime start = filter.getStartDate() != null ? filter.getStartDate() : LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime end = filter.getEndDate() != null ? filter.getEndDate() : LocalDateTime.of(year, 12, 31, 23, 59, 59);

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);
        List<HealthRecord> filteredRecords = filterHealthRecords(healthRecordRepository.findAll(), filter, start, end);
        List<Prescription> filteredPrescriptions = filterPrescriptions(prescriptionRepository.findAll(), filter, start, end);
        List<Campaign> filteredCampaigns = filterCampaigns(campaignRepository.findAll(), filter, start, end);
        List<Medicine> filteredMedicines = filterMedicines(medicineRepository.findAll(), filter, start, end);
        List<SosRequest> filteredSos = filterSosRequests(sosRequestRepository.findAll(), filter, start, end);

        long newCitizens = filteredCitizens.stream()
                .filter(c -> c.getCreatedAt() != null && !c.getCreatedAt().isBefore(start) && !c.getCreatedAt().isAfter(end))
                .count();
        long newRecords = filteredRecords.stream()
                .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(start) && !r.getCreatedAt().isAfter(end))
                .count();
        long createdPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getCreatedAt() != null && !p.getCreatedAt().isBefore(start) && !p.getCreatedAt().isAfter(end))
                .count();
        long dispensedPrescriptions = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.DISPENSED &&
                        p.getDispensedAt() != null && !p.getDispensedAt().isBefore(start) && !p.getDispensedAt().isAfter(end))
                .count();
        long activeCampaigns = filteredCampaigns.stream()
                .filter(c -> c.getStatus() == CampaignStatus.ACTIVE)
                .count();
        long newMedicines = filteredMedicines.stream()
                .filter(m -> m.getCreatedAt() != null && !m.getCreatedAt().isBefore(start) && !m.getCreatedAt().isAfter(end))
                .count();
        Map<String, Long> monthlyBreakdown = new LinkedHashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int m = 1; m <= 12; m++) {

            final int month = m;

            YearMonth ym = YearMonth.of(year, month);
            String monthKey = ym.format(monthFormatter);

            long countInMonth = filteredCitizens.stream()
                    .filter(c -> c.getCreatedAt() != null
                            && c.getCreatedAt().getYear() == year
                            && c.getCreatedAt().getMonthValue() == month)
                    .count();

            monthlyBreakdown.put(monthKey, countInMonth);
        }

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("targetYear", year);
        overview.put("totalFilteredCitizens", filteredCitizens.size());

        return YearlyReportResponse.builder()
                .reportTitle("Annual Health System Performance Report")
                .reportPeriod("YEARLY")
                .generatedAt(LocalDateTime.now())
                .startDate(start)
                .endDate(end)
                .appliedFilters(extractAppliedFilters(filter))
                .newCitizensRegistered(newCitizens)
                .newHealthRecordsCreated(newRecords)
                .prescriptionsCreated(createdPrescriptions)
                .prescriptionsDispensed(dispensedPrescriptions)
                .activeCampaigns(activeCampaigns)
                .newMedicinesAdded(newMedicines)
                .sosRequestsCount(filteredSos.size())
                .monthlyRegistrationBreakdown(monthlyBreakdown)
                .summaryOverview(overview)
                .build();
    }

    public DiseaseReportResponse getDiseaseReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);
        List<HealthRecord> filteredRecords = filterHealthRecords(healthRecordRepository.findAll(), filter, start, end);

        Map<String, Long> chronicMap = new HashMap<>();
        long chronicCount = 0;
        for (Citizen c : filteredCitizens) {
            String chronic = c.getChronicDiseases();
            if (chronic != null && !chronic.trim().isEmpty()) {
                chronicCount++;
                String[] split = chronic.split("[,;]");
                for (String disease : split) {
                    String cleaned = disease.trim();
                    if (!cleaned.isEmpty()) {
                        chronicMap.put(cleaned, chronicMap.getOrDefault(cleaned, 0L) + 1);
                    }
                }
            }
        }

        Map<String, Long> recordTypesMap = filteredRecords.stream()
                .filter(r -> r.getRecordType() != null)
                .collect(Collectors.groupingBy(r -> r.getRecordType().name(), Collectors.counting()));

        return DiseaseReportResponse.builder()
                .reportTitle("Epidemiological & Disease Surveillance Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalHealthRecords(filteredRecords.size())
                .citizensWithChronicDiseasesCount(chronicCount)
                .highRiskCitizensCount(chronicCount)
                .chronicDiseaseDistribution(chronicMap)
                .healthRecordsByType(recordTypesMap)
                .build();
    }

    public MedicineReportResponse getMedicineReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Medicine> filteredMedicines = filterMedicines(medicineRepository.findAll(), filter, start, end);
        List<Prescription> filteredPrescriptions = filterPrescriptions(prescriptionRepository.findAll(), filter, start, end);

        long totalMedicines = filteredMedicines.size();
        long totalStock = filteredMedicines.stream().mapToLong(m -> m.getQuantity() != null ? m.getQuantity() : 0).sum();

        LocalDate today = LocalDate.now();
        long lowStock = filteredMedicines.stream()
                .filter(m -> m.getQuantity() != null && m.getMinStockThreshold() != null &&
                        m.getQuantity() > 0 && m.getQuantity() <= m.getMinStockThreshold())
                .count();
        long outOfStock = filteredMedicines.stream()
                .filter(m -> m.getQuantity() != null && m.getQuantity() == 0)
                .count();
        long expired = filteredMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(today))
                .count();

        Map<String, Long> categoryMap = filteredMedicines.stream()
                .filter(m -> m.getCategory() != null && !m.getCategory().trim().isEmpty())
                .collect(Collectors.groupingBy(Medicine::getCategory, Collectors.counting()));

        long prescriptionsTotal = filteredPrescriptions.size();
        long prescriptionsPending = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.PENDING).count();
        long prescriptionsDispensed = filteredPrescriptions.stream()
                .filter(p -> p.getStatus() == PrescriptionStatus.DISPENSED).count();

        return MedicineReportResponse.builder()
                .reportTitle("Pharmaceutical Inventory & Supply Chain Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalMedicines(totalMedicines)
                .totalStockQuantity(totalStock)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .expiredCount(expired)
                .categoryBreakdown(categoryMap)
                .prescriptionsTotal(prescriptionsTotal)
                .prescriptionsPending(prescriptionsPending)
                .prescriptionsDispensed(prescriptionsDispensed)
                .build();
    }

    public CitizenReportResponse getCitizenReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Citizen> filteredCitizens = filterCitizens(citizenRepository.findAll(), filter, start, end);

        long total = filteredCitizens.size();

        Map<String, Long> genderMap = filteredCitizens.stream()
                .filter(c -> c.getGender() != null)
                .collect(Collectors.groupingBy(c -> c.getGender().name(), Collectors.counting()));

        Map<String, Long> ageGroupMap = new LinkedHashMap<>();
        ageGroupMap.put("0-18", filteredCitizens.stream().filter(c -> c.getAge() != null && c.getAge() <= 18).count());
        ageGroupMap.put("19-35", filteredCitizens.stream().filter(c -> c.getAge() != null && c.getAge() >= 19 && c.getAge() <= 35).count());
        ageGroupMap.put("36-60", filteredCitizens.stream().filter(c -> c.getAge() != null && c.getAge() >= 36 && c.getAge() <= 60).count());
        ageGroupMap.put("60+", filteredCitizens.stream().filter(c -> c.getAge() != null && c.getAge() > 60).count());

        long chronicCount = filteredCitizens.stream()
                .filter(c -> c.getChronicDiseases() != null && !c.getChronicDiseases().trim().isEmpty()).count();
        long allergyCount = filteredCitizens.stream()
                .filter(c -> c.getAllergies() != null && !c.getAllergies().trim().isEmpty()).count();

        Map<String, Long> villageMap = filteredCitizens.stream()
                .filter(c -> c.getVillage() != null && c.getVillage().getVillageName() != null)
                .collect(Collectors.groupingBy(c -> c.getVillage().getVillageName(), Collectors.counting()));

        return CitizenReportResponse.builder()
                .reportTitle("Demographic & Population Health Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalCitizens(total)
                .activeCitizens(total)
                .genderBreakdown(genderMap)
                .ageGroupBreakdown(ageGroupMap)
                .citizensWithChronicDiseases(chronicCount)
                .citizensWithAllergies(allergyCount)
                .villageBreakdown(villageMap)
                .build();
    }

    public HospitalReportResponse getHospitalReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Hospital> filteredHospitals = filterHospitals(hospitalRepository.findAll(), filter, start, end);

        long total = filteredHospitals.size();
        long beds = filteredHospitals.stream().mapToLong(h -> h.getBeds() != null ? h.getBeds() : 0).sum();
        long emergency = filteredHospitals.stream().filter(h -> Boolean.TRUE.equals(h.getEmergencyServices())).count();

        Map<String, Long> typeMap = filteredHospitals.stream()
                .filter(h -> h.getType() != null)
                .collect(Collectors.groupingBy(Hospital::getType, Collectors.counting()));

        Map<String, Long> statusMap = filteredHospitals.stream()
                .filter(h -> h.getStatus() != null)
                .collect(Collectors.groupingBy(Hospital::getStatus, Collectors.counting()));

        Map<String, Long> districtMap = filteredHospitals.stream()
                .filter(h -> h.getDistrict() != null)
                .collect(Collectors.groupingBy(Hospital::getDistrict, Collectors.counting()));

        return HospitalReportResponse.builder()
                .reportTitle("Hospital Infrastructure & Facility Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalHospitals(total)
                .totalBeds(beds)
                .emergencyServicesHospitals(emergency)
                .hospitalTypeBreakdown(typeMap)
                .hospitalStatusBreakdown(statusMap)
                .districtBreakdown(districtMap)
                .build();
    }

    public PhcReportResponse getPhcReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Phc> filteredPhcs = filterPhcs(phcRepository.findAll(), filter, start, end);

        long total = filteredPhcs.size();

        Map<String, Long> districtMap = filteredPhcs.stream()
                .filter(p -> p.getDistrict() != null)
                .collect(Collectors.groupingBy(Phc::getDistrict, Collectors.counting()));

        Map<String, Long> villageMap = filteredPhcs.stream()
                .filter(p -> p.getVillage() != null && p.getVillage().getVillageName() != null)
                .collect(Collectors.groupingBy(p -> p.getVillage().getVillageName(), Collectors.counting()));

        List<AshaWorker> allWorkers = ashaWorkerRepository.findAll();
        long assignedWorkers = allWorkers.stream()
                .filter(w -> w.getAssignedPHC() != null &&
                        filteredPhcs.stream().anyMatch(p -> p.getId().equals(w.getAssignedPHC().getId())))
                .count();

        return PhcReportResponse.builder()
                .reportTitle("Primary Health Centre (PHC) Assessment Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalPhcs(total)
                .districtBreakdown(districtMap)
                .villageBreakdown(villageMap)
                .totalAssignedAshaWorkers(assignedWorkers)
                .build();
    }

    public CampaignReportResponse getCampaignReport(ReportFilterRequest filter) {
        LocalDateTime start = filter.getStartDate();
        LocalDateTime end = filter.getEndDate();

        List<Campaign> filteredCampaigns = filterCampaigns(campaignRepository.findAll(), filter, start, end);

        long total = filteredCampaigns.size();
        long active = filteredCampaigns.stream().filter(c -> c.getStatus() == CampaignStatus.ACTIVE).count();
        long totalReach = filteredCampaigns.stream().mapToLong(c -> c.getReach() != null ? c.getReach() : 0).sum();
        double avgProgress = filteredCampaigns.stream()
                .mapToInt(c -> c.getProgress() != null ? c.getProgress() : 0)
                .average().orElse(0.0);

        Map<String, Long> statusMap = filteredCampaigns.stream()
                .filter(c -> c.getStatus() != null)
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));

        Map<String, Long> typeMap = filteredCampaigns.stream()
                .filter(c -> c.getType() != null)
                .collect(Collectors.groupingBy(Campaign::getType, Collectors.counting()));

        Map<String, Long> districtMap = filteredCampaigns.stream()
                .filter(c -> c.getDistrict() != null)
                .collect(Collectors.groupingBy(Campaign::getDistrict, Collectors.counting()));

        return CampaignReportResponse.builder()
                .reportTitle("Public Health Outreach & Campaign Performance Report")
                .generatedAt(LocalDateTime.now())
                .appliedFilters(extractAppliedFilters(filter))
                .totalCampaigns(total)
                .activeCampaigns(active)
                .totalReach(totalReach)
                .averageProgress(avgProgress)
                .campaignStatusBreakdown(statusMap)
                .campaignTypeBreakdown(typeMap)
                .districtBreakdown(districtMap)
                .build();
    }

    // --- Filtering Helper Methods ---

    private Map<String, Object> extractAppliedFilters(ReportFilterRequest filter) {
        Map<String, Object> map = new LinkedHashMap<>();
        if (filter == null) return map;
        if (filter.getStartDate() != null) map.put("startDate", filter.getStartDate());
        if (filter.getEndDate() != null) map.put("endDate", filter.getEndDate());
        if (filter.getDate() != null) map.put("date", filter.getDate());
        if (filter.getYear() != null) map.put("year", filter.getYear());
        if (filter.getVillageId() != null) map.put("villageId", filter.getVillageId());
        if (filter.getVillageName() != null) map.put("villageName", filter.getVillageName());
        if (filter.getPhcId() != null) map.put("phcId", filter.getPhcId());
        if (filter.getPhcName() != null) map.put("phcName", filter.getPhcName());
        if (filter.getHospitalId() != null) map.put("hospitalId", filter.getHospitalId());
        if (filter.getHospitalName() != null) map.put("hospitalName", filter.getHospitalName());
        if (filter.getDistrict() != null) map.put("district", filter.getDistrict());
        if (filter.getEffectiveHealthOfficerId() != null) map.put("healthOfficerId", filter.getEffectiveHealthOfficerId());
        if (filter.getEffectiveAshaWorkerId() != null) map.put("ashaWorkerId", filter.getEffectiveAshaWorkerId());
        return map;
    }

    private List<Citizen> filterCitizens(List<Citizen> citizens, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return citizens.stream().filter(c -> {
            if (start != null && c.getCreatedAt() != null && c.getCreatedAt().isBefore(start)) return false;
            if (end != null && c.getCreatedAt() != null && c.getCreatedAt().isAfter(end)) return false;
            if (filter.getVillageId() != null && (c.getVillage() == null || !filter.getVillageId().equals(c.getVillage().getId()))) return false;
            if (filter.getVillageName() != null && (c.getVillage() == null || !filter.getVillageName().equalsIgnoreCase(c.getVillage().getVillageName()))) return false;
            if (filter.getDistrict() != null && !matchesDistrict(c.getDistrict(), c.getVillage(), filter.getDistrict())) return false;
            if (filter.getPhcId() != null && (c.getVillage() == null || c.getVillage().getPhcs() == null ||
                    c.getVillage().getPhcs().stream().noneMatch(p -> filter.getPhcId().equals(p.getId())))) return false;
            if (filter.getPhcName() != null && (c.getVillage() == null || c.getVillage().getPhcs() == null ||
                    c.getVillage().getPhcs().stream().noneMatch(p -> filter.getPhcName().equalsIgnoreCase(p.getName())))) return false;
            if (filter.getEffectiveHealthOfficerId() != null && (c.getVillage() == null || c.getVillage().getHealthOfficer() == null ||
                    !filter.getEffectiveHealthOfficerId().equals(c.getVillage().getHealthOfficer().getId()))) return false;
            if (filter.getEffectiveAshaWorkerId() != null && (c.getVillage() == null || c.getVillage().getAshaWorkers() == null ||
                    c.getVillage().getAshaWorkers().stream().noneMatch(a -> filter.getEffectiveAshaWorkerId().equals(a.getId())))) return false;
            return true;
        }).collect(Collectors.toList());
    }

    private List<HealthRecord> filterHealthRecords(List<HealthRecord> records, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return records.stream().filter(r -> {
            if (start != null && r.getCreatedAt() != null && r.getCreatedAt().isBefore(start)) return false;
            if (end != null && r.getCreatedAt() != null && r.getCreatedAt().isAfter(end)) return false;
            if (filter.getHospitalName() != null && (r.getHospitalName() == null || !r.getHospitalName().toLowerCase().contains(filter.getHospitalName().toLowerCase()))) return false;
            Citizen c = r.getCitizen();
            if (c != null) {
                if (filter.getVillageId() != null && (c.getVillage() == null || !filter.getVillageId().equals(c.getVillage().getId()))) return false;
                if (filter.getVillageName() != null && (c.getVillage() == null || !filter.getVillageName().equalsIgnoreCase(c.getVillage().getVillageName()))) return false;
                if (filter.getDistrict() != null && !matchesDistrict(c.getDistrict(), c.getVillage(), filter.getDistrict())) return false;
                if (filter.getEffectiveHealthOfficerId() != null && (c.getVillage() == null || c.getVillage().getHealthOfficer() == null ||
                        !filter.getEffectiveHealthOfficerId().equals(c.getVillage().getHealthOfficer().getId()))) return false;
                if (filter.getEffectiveAshaWorkerId() != null && (c.getVillage() == null || c.getVillage().getAshaWorkers() == null ||
                        c.getVillage().getAshaWorkers().stream().noneMatch(a -> filter.getEffectiveAshaWorkerId().equals(a.getId())))) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private List<Prescription> filterPrescriptions(List<Prescription> prescriptions, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return prescriptions.stream().filter(p -> {
            if (start != null && p.getCreatedAt() != null && p.getCreatedAt().isBefore(start)) return false;
            if (end != null && p.getCreatedAt() != null && p.getCreatedAt().isAfter(end)) return false;
            Citizen c = p.getCitizen();
            if (c != null) {
                if (filter.getVillageId() != null && (c.getVillage() == null || !filter.getVillageId().equals(c.getVillage().getId()))) return false;
                if (filter.getVillageName() != null && (c.getVillage() == null || !filter.getVillageName().equalsIgnoreCase(c.getVillage().getVillageName()))) return false;
                if (filter.getDistrict() != null && !matchesDistrict(c.getDistrict(), c.getVillage(), filter.getDistrict())) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private List<Campaign> filterCampaigns(List<Campaign> campaigns, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return campaigns.stream().filter(c -> {
            if (start != null && c.getCreatedAt() != null && c.getCreatedAt().isBefore(start)) return false;
            if (end != null && c.getCreatedAt() != null && c.getCreatedAt().isAfter(end)) return false;
            if (filter.getDistrict() != null && (c.getDistrict() == null || !filter.getDistrict().equalsIgnoreCase(c.getDistrict()))) return false;
            return true;
        }).collect(Collectors.toList());
    }

    private List<Medicine> filterMedicines(List<Medicine> medicines, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return medicines.stream().filter(m -> {
            if (start != null && m.getCreatedAt() != null && m.getCreatedAt().isBefore(start)) return false;
            if (end != null && m.getCreatedAt() != null && m.getCreatedAt().isAfter(end)) return false;
            return true;
        }).collect(Collectors.toList());
    }

    private List<Hospital> filterHospitals(List<Hospital> hospitals, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return hospitals.stream().filter(h -> {
            if (start != null && h.getCreatedAt() != null && h.getCreatedAt().isBefore(start)) return false;
            if (end != null && h.getCreatedAt() != null && h.getCreatedAt().isAfter(end)) return false;
            if (filter.getHospitalId() != null && !filter.getHospitalId().equals(h.getId())) return false;
            if (filter.getHospitalName() != null && (h.getName() == null || !h.getName().toLowerCase().contains(filter.getHospitalName().toLowerCase()))) return false;
            if (filter.getDistrict() != null && (h.getDistrict() == null || !filter.getDistrict().equalsIgnoreCase(h.getDistrict()))) return false;
            return true;
        }).collect(Collectors.toList());
    }

    private List<Phc> filterPhcs(List<Phc> phcs, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return phcs.stream().filter(p -> {
            if (start != null && p.getCreatedAt() != null && p.getCreatedAt().isBefore(start)) return false;
            if (end != null && p.getCreatedAt() != null && p.getCreatedAt().isAfter(end)) return false;
            if (filter.getPhcId() != null && !filter.getPhcId().equals(p.getId())) return false;
            if (filter.getPhcName() != null && (p.getName() == null || !p.getName().toLowerCase().contains(filter.getPhcName().toLowerCase()))) return false;
            if (filter.getVillageId() != null && (p.getVillage() == null || !filter.getVillageId().equals(p.getVillage().getId()))) return false;
            if (filter.getVillageName() != null && (p.getVillage() == null || !filter.getVillageName().equalsIgnoreCase(p.getVillage().getVillageName()))) return false;
            if (filter.getDistrict() != null && !matchesDistrict(p.getDistrict(), p.getVillage(), filter.getDistrict())) return false;
            return true;
        }).collect(Collectors.toList());
    }

    private List<SosRequest> filterSosRequests(List<SosRequest> requests, ReportFilterRequest filter, LocalDateTime start, LocalDateTime end) {
        return requests.stream().filter(s -> {
            if (start != null && s.getCreatedAt() != null && s.getCreatedAt().isBefore(start)) return false;
            if (end != null && s.getCreatedAt() != null && s.getCreatedAt().isAfter(end)) return false;
            Citizen c = s.getCitizen();
            if (c != null) {
                if (filter.getVillageId() != null && (c.getVillage() == null || !filter.getVillageId().equals(c.getVillage().getId()))) return false;
                if (filter.getDistrict() != null && !matchesDistrict(c.getDistrict(), c.getVillage(), filter.getDistrict())) return false;
            }
            return true;
        }).collect(Collectors.toList());
    }

    private boolean matchesDistrict(String directDistrict, Village village, String targetDistrict) {
        if (targetDistrict == null) return true;
        if (directDistrict != null && directDistrict.equalsIgnoreCase(targetDistrict)) return true;
        return village != null && village.getDistrict() != null && village.getDistrict().equalsIgnoreCase(targetDistrict);
    }
}
