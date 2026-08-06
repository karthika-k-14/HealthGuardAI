package com.healthguard.service;

import com.healthguard.dto.CampaignStatisticsResponse;
import com.healthguard.dto.CitizenStatisticsResponse;
import com.healthguard.dto.DashboardSummaryResponse;
import com.healthguard.dto.DiseaseStatisticsResponse;
import com.healthguard.dto.HospitalStatisticsResponse;
import com.healthguard.dto.MedicineStatisticsResponse;
import com.healthguard.dto.ReportAnalyticsResponse;
import com.healthguard.dto.TotalCountResponse;
import com.healthguard.entity.CampaignStatus;
import com.healthguard.entity.Gender;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.repository.AshaWorkerRepository;
import com.healthguard.repository.CampaignRepository;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.HealthOfficerRepository;
import com.healthguard.repository.HealthRecordRepository;
import com.healthguard.repository.HospitalRepository;
import com.healthguard.repository.MedicineRepository;
import com.healthguard.repository.NotificationRepository;
import com.healthguard.repository.PharmacistRepository;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.PrescriptionRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service orchestrating analytics, statistical summaries, and periodic report generation.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final CitizenRepository citizenRepository;
    private final AshaWorkerRepository ashaWorkerRepository;
    private final HealthOfficerRepository healthOfficerRepository;
    private final PharmacistRepository pharmacistRepository;
    private final HospitalRepository hospitalRepository;
    private final PhcRepository phcRepository;
    private final VillageRepository villageRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final CampaignRepository campaignRepository;
    private final NotificationRepository notificationRepository;
    private final HealthRecordRepository healthRecordRepository;

    public DashboardSummaryResponse getDashboardSummary() {
        long totalCitizens = citizenRepository.count();
        long totalAshaWorkers = ashaWorkerRepository.count();
        long totalHealthOfficers = healthOfficerRepository.count();
        long totalPharmacists = pharmacistRepository.count();
        long totalHospitals = hospitalRepository.count();
        long totalPhcs = phcRepository.count();
        long totalVillages = villageRepository.count();
        long totalMedicines = medicineRepository.count();
        long totalPrescriptions = prescriptionRepository.count();
        long totalCampaigns = campaignRepository.count();
        long totalNotifications = notificationRepository.count();

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("lowStockMedicines", medicineRepository.countLowStock());
        overview.put("outOfStockMedicines", medicineRepository.countOutOfStockCount());
        overview.put("pendingPrescriptions", prescriptionRepository.countByStatus(PrescriptionStatus.PENDING));
        overview.put("activeCampaigns", campaignRepository.countByStatus(CampaignStatus.ACTIVE));
        overview.put("emergencyHospitals", hospitalRepository.countByEmergencyServicesTrue());

        return DashboardSummaryResponse.builder()
                .totalCitizens(totalCitizens)
                .totalAshaWorkers(totalAshaWorkers)
                .totalHealthOfficers(totalHealthOfficers)
                .totalPharmacists(totalPharmacists)
                .totalHospitals(totalHospitals)
                .totalPhcs(totalPhcs)
                .totalVillages(totalVillages)
                .totalMedicines(totalMedicines)
                .totalPrescriptions(totalPrescriptions)
                .totalCampaigns(totalCampaigns)
                .totalNotifications(totalNotifications)
                .summaryOverview(overview)
                .build();
    }

    public TotalCountResponse getTotalCitizens() {
        return new TotalCountResponse("Citizens", citizenRepository.count());
    }

    public TotalCountResponse getTotalAshaWorkers() {
        return new TotalCountResponse("ASHA Workers", ashaWorkerRepository.count());
    }

    public TotalCountResponse getTotalHealthOfficers() {
        return new TotalCountResponse("Health Officers", healthOfficerRepository.count());
    }

    public TotalCountResponse getTotalPharmacists() {
        return new TotalCountResponse("Pharmacists", pharmacistRepository.count());
    }

    public TotalCountResponse getTotalHospitals() {
        return new TotalCountResponse("Hospitals", hospitalRepository.count());
    }

    public TotalCountResponse getTotalPhcs() {
        return new TotalCountResponse("PHCs", phcRepository.count());
    }

    public TotalCountResponse getTotalVillages() {
        return new TotalCountResponse("Villages", villageRepository.count());
    }

    public TotalCountResponse getTotalMedicines() {
        return new TotalCountResponse("Medicines", medicineRepository.count());
    }

    public TotalCountResponse getTotalPrescriptions() {
        return new TotalCountResponse("Prescriptions", prescriptionRepository.count());
    }

    public TotalCountResponse getTotalCampaigns() {
        return new TotalCountResponse("Campaigns", campaignRepository.count());
    }

    public TotalCountResponse getTotalNotifications() {
        return new TotalCountResponse("Notifications", notificationRepository.count());
    }

    public CitizenStatisticsResponse getCitizenStatistics() {
        long total = citizenRepository.count();

        Map<String, Long> genderMap = new LinkedHashMap<>();
        genderMap.put("MALE", citizenRepository.countByGender(Gender.MALE));
        genderMap.put("FEMALE", citizenRepository.countByGender(Gender.FEMALE));
        genderMap.put("OTHER", citizenRepository.countByGender(Gender.OTHER));

        Map<String, Long> ageGroupMap = new LinkedHashMap<>();
        ageGroupMap.put("0-18", citizenRepository.countByAgeBetween(0, 18));
        ageGroupMap.put("19-35", citizenRepository.countByAgeBetween(19, 35));
        ageGroupMap.put("36-60", citizenRepository.countByAgeBetween(36, 60));
        ageGroupMap.put("60+", citizenRepository.countByAgeBetween(61, 150));

        return CitizenStatisticsResponse.builder()
                .totalCitizens(total)
                .activeCitizens(total)
                .inactiveCitizens(0L)
                .genderBreakdown(genderMap)
                .ageGroupBreakdown(ageGroupMap)
                .citizensWithChronicDiseases(citizenRepository.countWithChronicDiseases())
                .citizensWithAllergies(citizenRepository.countWithAllergies())
                .build();
    }

    public MedicineStatisticsResponse getMedicineStatistics() {
        long totalMedicines = medicineRepository.count();
        long totalStock = medicineRepository.sumTotalQuantity();
        long lowStock = medicineRepository.countLowStock();
        long outOfStock = medicineRepository.countOutOfStockCount();
        long expired = medicineRepository.countExpired();

        Map<String, Long> categoryMap = convertToMap(medicineRepository.countGroupedByCategory());

        return MedicineStatisticsResponse.builder()
                .totalMedicines(totalMedicines)
                .totalStockQuantity(totalStock)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .expiredCount(expired)
                .categoryBreakdown(categoryMap)
                .build();
    }

    public DiseaseStatisticsResponse getDiseaseStatistics() {
        long chronicCount = citizenRepository.countWithChronicDiseases();
        List<String> chronicDiseaseEntries = citizenRepository.findAllChronicDiseases();

        Map<String, Long> diseaseFrequency = new HashMap<>();
        for (String entry : chronicDiseaseEntries) {
            if (entry != null && !entry.trim().isEmpty()) {
                String[] split = entry.split("[,;]");
                for (String disease : split) {
                    String cleaned = disease.trim();
                    if (!cleaned.isEmpty()) {
                        diseaseFrequency.put(cleaned, diseaseFrequency.getOrDefault(cleaned, 0L) + 1);
                    }
                }
            }
        }

        Map<String, Long> recordTypesMap = convertToMap(healthRecordRepository.countGroupedByRecordType());

        return DiseaseStatisticsResponse.builder()
                .citizensWithChronicDiseasesCount(chronicCount)
                .chronicDiseaseDistribution(diseaseFrequency)
                .healthRecordsByType(recordTypesMap)
                .highRiskCitizensCount(chronicCount)
                .build();
    }

    public HospitalStatisticsResponse getHospitalStatistics() {
        long totalHospitals = hospitalRepository.count();
        long totalBeds = hospitalRepository.sumTotalBeds();
        long emergencyCount = hospitalRepository.countByEmergencyServicesTrue();
        long totalPhcs = phcRepository.count();

        Map<String, Long> typeMap = convertToMap(hospitalRepository.countGroupedByType());
        Map<String, Long> statusMap = convertToMap(hospitalRepository.countGroupedByStatus());

        return HospitalStatisticsResponse.builder()
                .totalHospitals(totalHospitals)
                .totalBeds(totalBeds)
                .emergencyServicesHospitals(emergencyCount)
                .hospitalTypeBreakdown(typeMap)
                .hospitalStatusBreakdown(statusMap)
                .totalPhcs(totalPhcs)
                .build();
    }

    public CampaignStatisticsResponse getCampaignStatistics() {
        long totalCampaigns = campaignRepository.count();
        long totalReach = campaignRepository.sumTotalReach();
        double avgProgress = campaignRepository.avgProgress();

        Map<String, Long> statusMap = convertToMap(campaignRepository.countGroupedByStatus());
        Map<String, Long> typeMap = convertToMap(campaignRepository.countGroupedByType());

        return CampaignStatisticsResponse.builder()
                .totalCampaigns(totalCampaigns)
                .campaignStatusBreakdown(statusMap)
                .totalReach(totalReach)
                .averageProgress(avgProgress)
                .campaignTypeBreakdown(typeMap)
                .build();
    }

    public ReportAnalyticsResponse getMonthlyReport() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.withDayOfMonth(1).with(LocalTime.MIN);
        return generateReport("MONTHLY", start, now);
    }

    public ReportAnalyticsResponse getWeeklyReport() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusDays(7).with(LocalTime.MIN);
        return generateReport("WEEKLY", start, now);
    }

    public ReportAnalyticsResponse getDailyReport() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.with(LocalTime.MIN);
        return generateReport("DAILY", start, now);
    }

    public ReportAnalyticsResponse generateReport(String reportType, LocalDateTime start, LocalDateTime end) {
        long newCitizens = citizenRepository.countByCreatedAtBetween(start, end);
        long newHealthRecords = healthRecordRepository.countByCreatedAtBetween(start, end);
        long newPrescriptions = prescriptionRepository.countByCreatedAtBetween(start, end);
        long dispensedPrescriptions = prescriptionRepository.countByStatusAndDispensedAtBetween(
                PrescriptionStatus.DISPENSED, start, end);
        long sentNotifications = notificationRepository.countByCreatedAtBetween(start, end);
        long activeCampaigns = campaignRepository.countByStatus(CampaignStatus.ACTIVE);
        long newMedicines = medicineRepository.countByCreatedAtBetween(start, end);

        return ReportAnalyticsResponse.builder()
                .reportType(reportType)
                .startDate(start)
                .endDate(end)
                .newCitizensRegistered(newCitizens)
                .newHealthRecordsCreated(newHealthRecords)
                .prescriptionsCreated(newPrescriptions)
                .prescriptionsDispensed(dispensedPrescriptions)
                .notificationsSent(sentNotifications)
                .activeCampaigns(activeCampaigns)
                .newMedicinesAdded(newMedicines)
                .build();
    }

    private Map<String, Long> convertToMap(List<Object[]> queryResults) {
        Map<String, Long> map = new LinkedHashMap<>();
        if (queryResults != null) {
            for (Object[] row : queryResults) {
                if (row != null && row.length >= 2 && row[0] != null) {
                    String key = row[0].toString();
                    Long value = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                    map.put(key, value);
                }
            }
        }
        return map;
    }
}
