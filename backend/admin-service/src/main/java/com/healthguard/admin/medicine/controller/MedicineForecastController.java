package com.healthguard.admin.medicine.controller;

import com.healthguard.admin.medicine.client.MLForecastClient;
import com.healthguard.admin.medicine.entity.ExpiryRiskAlert;
import com.healthguard.admin.medicine.entity.MedicineDemandForecast;
import com.healthguard.admin.medicine.entity.MedicineUsageHistory;
import com.healthguard.admin.medicine.repository.MedicineUsageHistoryRepository;
import com.healthguard.admin.medicine.service.ExpiryRiskService;
import com.healthguard.admin.medicine.service.MedicineForecastService;
import com.healthguard.admin.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@RestController
@RequestMapping({"/api/pharmacist", "/pharmacist"})
@RequiredArgsConstructor
public class MedicineForecastController {

    private final MedicineForecastService forecastService;
    private final ExpiryRiskService expiryRiskService;
    private final MLForecastClient mlForecastClient;
    private final MedicineUsageHistoryRepository usageHistoryRepository;
    private final com.healthguard.admin.pharmacist.service.PharmacistService pharmacistService;

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<List<MedicineDemandForecast>>> getForecasts() {
        return ResponseEntity.ok(ApiResponse.success("ML medicine demand forecasts retrieved", forecastService.getAllLatestForecasts()));
    }

    @GetMapping("/forecast/top-needed")
    public ResponseEntity<ApiResponse<List<MedicineDemandForecast>>> getTopNeeded() {
        return ResponseEntity.ok(ApiResponse.success("Top 10 medicines needed next month", forecastService.getTopNeededMedicines()));
    }

    @GetMapping("/forecast/restock-recommendations")
    public ResponseEntity<List<com.healthguard.admin.medicine.dto.ForecastRecommendationDTO>> getRestockRecommendations() {
        return ResponseEntity.ok(forecastService.getRestockRecommendationsDTO());
    }

    @GetMapping("/forecast/insights")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAIInsights() {
        return ResponseEntity.ok(ApiResponse.success("Epidemiological AI insights retrieved", forecastService.generateDynamicAIInsights()));
    }

    @GetMapping("/forecast/explanation/{medicineId}")
    public ResponseEntity<?> getExplanation(@PathVariable("medicineId") Long medicineId) {
        Map<String, Object> explanation = mlForecastClient.getExplanation(medicineId);
        return ResponseEntity.ok(ApiResponse.success("SHAP explanation retrieved", explanation));
    }

    @GetMapping("/forecast/anomalies")
    public ResponseEntity<?> getAnomalies() {
        return ResponseEntity.ok(ApiResponse.success("Demand anomaly alerts retrieved", mlForecastClient.getAnomalies()));
    }

    @GetMapping("/forecast/outbreaks")
    public ResponseEntity<?> getOutbreaks() {
        return ResponseEntity.ok(ApiResponse.success("Outbreak risk predictions retrieved", mlForecastClient.getOutbreakPredictions()));
    }

    @GetMapping("/forecast/model-metrics")
    public ResponseEntity<?> getModelMetrics() {
        return ResponseEntity.ok(ApiResponse.success("ML model tournament metrics retrieved", mlForecastClient.getModelMetrics()));
    }

    @PostMapping("/forecast/run")
    public ResponseEntity<ApiResponse<List<MedicineDemandForecast>>> triggerForecastRun() {
        return ResponseEntity.ok(ApiResponse.success("ML demand forecasting completed successfully", forecastService.runFullForecast()));
    }

    @PostMapping("/forecast/retrain")
    public ResponseEntity<?> triggerRetraining() {
        Map<String, Object> result = mlForecastClient.triggerRetraining();
        forecastService.runFullForecast();
        return ResponseEntity.ok(ApiResponse.success("Model retraining completed", result));
    }

    @PostMapping("/forecast/rollback")
    public ResponseEntity<?> triggerRollback(@RequestBody Map<String, String> body) {
        String version = body.get("version");
        if (version == null || version.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Version parameter is required"));
        }
        Map<String, Object> result = mlForecastClient.triggerRollback(version);
        forecastService.runFullForecast();
        return ResponseEntity.ok(ApiResponse.success("Model rollback executed", result));
    }

    @GetMapping("/expiry-alerts")
    public ResponseEntity<ApiResponse<List<ExpiryRiskAlert>>> getExpiryAlerts(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = queryEmail;
        if (email == null || email.isBlank()) {
            if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
                email = authentication.getName();
            } else if (request != null) {
                email = request.getHeader("X-User-Email");
            }
        }
        int threshold = pharmacistService != null ? pharmacistService.getExpiryWarningThreshold(email) : 60;
        List<ExpiryRiskAlert> allAlerts = expiryRiskService.getActiveAlerts();
        List<ExpiryRiskAlert> filtered = allAlerts.stream()
                .filter(a -> a.getDaysRemaining() != null && a.getDaysRemaining() <= threshold)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Expiry risk alerts retrieved", filtered));
    }

    @GetMapping("/expiry-alerts/critical")
    public ResponseEntity<ApiResponse<List<ExpiryRiskAlert>>> getCriticalExpiryAlerts() {
        return ResponseEntity.ok(ApiResponse.success("Critical expiry alerts (<=30 days) retrieved", expiryRiskService.getCriticalAlerts()));
    }

    @PostMapping("/expiry-alerts/run")
    public ResponseEntity<ApiResponse<List<ExpiryRiskAlert>>> triggerExpiryRun() {
        return ResponseEntity.ok(ApiResponse.success("Expiry risk assessment completed", expiryRiskService.assessAndStoreExpiryRisks()));
    }

    @PostMapping("/medicines/issue")
    public ResponseEntity<?> issueMedicine(@RequestBody Map<String, Object> body) {
        Long medId = Long.valueOf(body.get("medicineId").toString());
        String medName = (String) body.get("medicineName");
        Integer qty = Integer.valueOf(body.get("quantityUsed").toString());
        String disease = (String) body.getOrDefault("disease", "General Treatment");
        String village = (String) body.getOrDefault("village", "Bhubaneswar");
        LocalDate dt = body.containsKey("usageDate") ? LocalDate.parse(body.get("usageDate").toString()) : LocalDate.now();

        MedicineUsageHistory record = MedicineUsageHistory.builder()
                .medicineId(medId)
                .medicineName(medName)
                .quantityUsed(qty)
                .disease(disease)
                .village(village)
                .usageDate(dt)
                .build();

        MedicineUsageHistory saved = usageHistoryRepository.save(record);
        return ResponseEntity.ok(ApiResponse.success("Medicine consumption recorded successfully", saved));
    }
}
