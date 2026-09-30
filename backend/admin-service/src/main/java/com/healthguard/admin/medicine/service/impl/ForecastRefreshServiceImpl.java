package com.healthguard.admin.medicine.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthguard.admin.medicine.client.MLForecastClient;
import com.healthguard.admin.medicine.entity.DemandAnomalyAlert;
import com.healthguard.admin.medicine.entity.ExpiryRiskAlert;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import com.healthguard.admin.medicine.repository.DemandAnomalyAlertRepository;
import com.healthguard.admin.medicine.repository.ExpiryRiskAlertRepository;
import com.healthguard.admin.medicine.repository.MedicineDemandForecastRepository;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.medicine.service.ExpiryRiskService;
import com.healthguard.admin.medicine.service.ForecastRefreshService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForecastRefreshServiceImpl implements ForecastRefreshService {

    private final MedicineRepository medicineRepository;
    private final MedicineDemandForecastRepository forecastRepository;
    private final ExpiryRiskAlertRepository expiryAlertRepository;
    private final DemandAnomalyAlertRepository demandAnomalyAlertRepository;
    private final MLForecastClient mlForecastClient;
    private final ExpiryRiskService expiryRiskService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Transactional
    public List<MedicineDemandForecast> refreshAllForecasts() {
        log.info("Executing full ML Forecast Refresh cycle across all medicines...");
        List<Medicine> medicines = medicineRepository.findAll();

        if (medicines.isEmpty()) {
            log.info("Inventory is empty. Clearing all forecast and alert tables.");
            forecastRepository.deleteAllInBatch();
            expiryAlertRepository.deleteAllInBatch();
            demandAnomalyAlertRepository.deleteAllInBatch();
            return Collections.emptyList();
        }

        // 1. Generate fresh predictions for every medicine in inventory (no write locks held during ML calls)
        List<MedicineDemandForecast> freshForecasts = new ArrayList<>(medicines.size());
        for (Medicine med : medicines) {
            freshForecasts.add(buildForecastFromML(med));
        }

        // 2. Atomically clear previous cycle and batch insert fresh predictions (guarantees 1-to-1 rows, no unbounded growth)
        forecastRepository.deleteAllInBatch();
        List<MedicineDemandForecast> saved = forecastRepository.saveAll(freshForecasts);
        log.info("Full forecast refresh complete. Persisted {} 1-to-1 forecast records.", saved.size());

        // 3. Synchronize expiry risk alerts
        try {
            expiryRiskService.assessAndStoreExpiryRisks();
        } catch (Exception e) {
            log.warn("Non-critical error during expiry risk sync: {}", e.getMessage());
        }

        // 4. Synchronize anomaly alerts
        try {
            syncAnomalyAlerts();
        } catch (Exception e) {
            log.warn("Non-critical error during anomaly alert sync: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    @Transactional
    public MedicineDemandForecast refreshMedicineForecast(Long medicineId) {
        if (medicineId == null) return null;

        Optional<Medicine> medOpt = medicineRepository.findById(medicineId);
        if (medOpt.isEmpty()) {
            log.warn("Medicine ID {} no longer exists in inventory. Removing associated forecast.", medicineId);
            removeMedicineForecast(medicineId);
            return null;
        }

        Medicine med = medOpt.get();
        MedicineDemandForecast freshData = buildForecastFromML(med);

        // Atomic Upsert: Update existing record or create new (guarantees exactly 1 row per medicine)
        Optional<MedicineDemandForecast> existingOpt = forecastRepository.findByMedicineId(medicineId);
        MedicineDemandForecast forecastToSave;

        if (existingOpt.isPresent()) {
            forecastToSave = existingOpt.get();
            forecastToSave.setMedicineName(freshData.getMedicineName());
            forecastToSave.setCurrentStock(freshData.getCurrentStock());
            forecastToSave.setPredictedDemand(freshData.getPredictedDemand());
            forecastToSave.setConfidence(freshData.getConfidence());
            forecastToSave.setRiskLevel(freshData.getRiskLevel());
            forecastToSave.setRecommendedOrder(freshData.getRecommendedOrder());
            forecastToSave.setEstimatedDaysOfStockRemaining(freshData.getEstimatedDaysOfStockRemaining());
            forecastToSave.setInsights(freshData.getInsights());
            forecastToSave.setTopFactorsJson(freshData.getTopFactorsJson());
            forecastToSave.setModelVersion(freshData.getModelVersion());
            forecastToSave.setGeneratedAt(LocalDateTime.now());
        } else {
            forecastToSave = freshData;
            forecastToSave.setGeneratedAt(LocalDateTime.now());
        }

        MedicineDemandForecast saved = forecastRepository.save(forecastToSave);
        log.info("Synchronized forecast for '{}' (ID: {}): Stock={}, Demand={}, RecommendedOrder={}, Risk={}",
                saved.getMedicineName(), medicineId, saved.getCurrentStock(), saved.getPredictedDemand(),
                saved.getRecommendedOrder(), saved.getRiskLevel());

        // Update single-medicine expiry and anomaly alerts
        updateExpiryAlertForMedicine(med);
        updateAnomalyAlertForMedicine(med, saved);

        return saved;
    }

    @Override
    @Async
    public void refreshMedicineForecastAsync(Long medicineId) {
        try {
            refreshMedicineForecast(medicineId);
        } catch (Exception e) {
            log.error("Async forecast refresh failed for medicine ID {}: {}", medicineId, e.getMessage());
        }
    }

    @Override
    @Transactional
    public void refreshMedicinesBatch(List<Long> medicineIds) {
        if (medicineIds == null || medicineIds.isEmpty()) return;

        Set<Long> uniqueIds = medicineIds.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        log.info("Batch refreshing forecasts for {} distinct medicines...", uniqueIds.size());

        for (Long id : uniqueIds) {
            try {
                refreshMedicineForecast(id);
            } catch (Exception e) {
                log.warn("Failed to refresh forecast for medicine {}: {}", id, e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void removeMedicineForecast(Long medicineId) {
        if (medicineId == null) return;
        try {
            forecastRepository.deleteByMedicineId(medicineId);
            expiryAlertRepository.deleteByMedicineId(medicineId);
            demandAnomalyAlertRepository.deleteByMedicineId(medicineId);
            log.info("Purged forecast and associated alerts for deleted medicine ID: {}", medicineId);
        } catch (Exception e) {
            log.error("Error purging forecast for medicine ID {}: {}", medicineId, e.getMessage());
        }
    }

    private MedicineDemandForecast buildForecastFromML(Medicine med) {
        String medName = med.getMedicineName() != null ? med.getMedicineName()
                : (med.getName() != null ? med.getName() : "Medicine-" + med.getId());
        int currentStock = med.getQuantity() != null ? med.getQuantity() : 0;

        Map<String, Object> mlResult;
        try {
            mlResult = mlForecastClient.predictDemand(med.getId(), medName, "Bhubaneswar", 120, currentStock);
        } catch (Exception e) {
            log.warn("ML prediction call failed for medicine '{}' (ID: {}): {}. Using baseline projection.", medName, med.getId(), e.getMessage());
            mlResult = Collections.emptyMap();
        }

        int predictedDemand = ((Number) mlResult.getOrDefault("predictedDemand", Math.max(50, currentStock * 2))).intValue();
        double confidence = ((Number) mlResult.getOrDefault("confidence", 0.88)).doubleValue();

        // Calculate dynamic recommended order: Math.max(0, predictedDemand - currentStock)
        int recommendedOrder = Math.max(0, predictedDemand - currentStock);

        // Derive risk level from actual stock and demand
        String riskLevel;
        if (currentStock == 0) {
            riskLevel = "CRITICAL";
        } else if (mlResult.containsKey("riskLevel")) {
            riskLevel = (String) mlResult.get("riskLevel");
        } else if (currentStock <= (med.getMinStockThreshold() != null ? med.getMinStockThreshold() : 10)) {
            riskLevel = "CRITICAL";
        } else if (currentStock < predictedDemand) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "MEDIUM";
        }

        int daysRemaining = ((Number) mlResult.getOrDefault("estimatedDaysOfStockRemaining",
                Math.max(1, currentStock > 0 ? (currentStock * 30) / Math.max(1, predictedDemand) : 0))).intValue();

        String topFactorsJson = "";
        try {
            topFactorsJson = objectMapper.writeValueAsString(mlResult.getOrDefault("explanation", Collections.emptyMap()));
        } catch (Exception ignored) {}

        String insight = String.format(
                "Current Stock: %d | Predicted Demand: %d | Recommended Order: %d | Days Remaining: %d | Risk: %s",
                currentStock, predictedDemand, recommendedOrder, daysRemaining, riskLevel
        );

        return MedicineDemandForecast.builder()
                .medicineId(med.getId())
                .medicineName(medName)
                .currentStock(currentStock)
                .predictedDemand(predictedDemand)
                .confidence(confidence)
                .riskLevel(riskLevel)
                .recommendedOrder(recommendedOrder)
                .estimatedDaysOfStockRemaining(daysRemaining)
                .insights(insight)
                .topFactorsJson(topFactorsJson)
                .modelVersion("v_2.0_ML")
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private void updateExpiryAlertForMedicine(Medicine med) {
        if (med.getExpiryDate() == null) {
            expiryAlertRepository.deleteByMedicineId(med.getId());
            return;
        }

        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), med.getExpiryDate());
        int days = (int) daysRemaining;

        if (days > 90) {
            // No risk alert required beyond 90 days
            expiryAlertRepository.deleteByMedicineId(med.getId());
            return;
        }

        String riskLevel;
        if (days <= 0) {
            riskLevel = "EXPIRED";
        } else if (days <= 30) {
            riskLevel = "CRITICAL";
        } else if (days <= 60) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "MEDIUM";
        }

        String batch = med.getBatchNumber() != null ? med.getBatchNumber() : "BATCH-" + med.getId();
        String medName = med.getMedicineName() != null ? med.getMedicineName() : med.getName();
        int qty = med.getQuantity() != null ? med.getQuantity() : 0;

        Optional<ExpiryRiskAlert> existingAlert = expiryAlertRepository.findByMedicineId(med.getId());
        ExpiryRiskAlert alert = existingAlert.orElseGet(() -> ExpiryRiskAlert.builder().medicineId(med.getId()).build());

        alert.setMedicineName(medName);
        alert.setBatchNumber(batch);
        alert.setQuantity(qty);
        alert.setExpiryDate(med.getExpiryDate());
        alert.setDaysRemaining(days);
        alert.setRiskLevel(riskLevel);
        alert.setStatus("ACTIVE");

        expiryAlertRepository.save(alert);
    }

    private void updateAnomalyAlertForMedicine(Medicine med, MedicineDemandForecast forecast) {
        // High divergence or severe stockout risk constitutes an anomaly
        if ("CRITICAL".equalsIgnoreCase(forecast.getRiskLevel()) && forecast.getCurrentStock() <= 10 && forecast.getPredictedDemand() > 50) {
            Optional<DemandAnomalyAlert> existingOpt = demandAnomalyAlertRepository.findFirstByMedicineIdOrderByCreatedAtDesc(med.getId());
            DemandAnomalyAlert alert = existingOpt.orElseGet(() -> DemandAnomalyAlert.builder().medicineId(med.getId()).build());

            alert.setMedicineName(forecast.getMedicineName());
            alert.setAnomalyScore(0.85);
            alert.setSeverity("HIGH");
            alert.setDescription(String.format("Critical stockout risk: stock is %d while projected demand is %d units.",
                    forecast.getCurrentStock(), forecast.getPredictedDemand()));

            demandAnomalyAlertRepository.save(alert);
        } else {
            demandAnomalyAlertRepository.deleteByMedicineId(med.getId());
        }
    }

    private void syncAnomalyAlerts() {
        try {
            List<Map<String, Object>> anomalies = mlForecastClient.getAnomalies();
            if (anomalies != null && !anomalies.isEmpty()) {
                demandAnomalyAlertRepository.deleteAllInBatch();
                for (Map<String, Object> a : anomalies) {
                    DemandAnomalyAlert alert = DemandAnomalyAlert.builder()
                            .medicineId(a.containsKey("medicineId") ? ((Number) a.get("medicineId")).longValue() : null)
                            .medicineName((String) a.getOrDefault("medicineName", "Unknown Medicine"))
                            .anomalyScore(a.containsKey("anomalyScore") ? ((Number) a.get("anomalyScore")).doubleValue() : 0.8)
                            .severity((String) a.getOrDefault("severity", "HIGH"))
                            .description((String) a.getOrDefault("description", "High divergence detected by ML model"))
                            .build();
                    demandAnomalyAlertRepository.save(alert);
                }
            }
        } catch (Exception e) {
            log.warn("Could not sync anomalies from ML service: {}", e.getMessage());
        }
    }
}
