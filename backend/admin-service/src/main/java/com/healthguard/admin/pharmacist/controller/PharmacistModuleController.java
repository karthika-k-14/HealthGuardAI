package com.healthguard.admin.pharmacist.controller;

import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.prescription.entity.Prescription;
import com.healthguard.admin.prescription.repository.PrescriptionRepository;
import com.healthguard.admin.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/pharmacist", "/pharmacist"})
@RequiredArgsConstructor
public class PharmacistModuleController {

    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final com.healthguard.admin.service.AuditLogService auditLogService;
    private final com.healthguard.admin.medicine.repository.MedicineUsageHistoryRepository usageHistoryRepository;
    private final com.healthguard.admin.medicine.service.ForecastRefreshService forecastRefreshService;
    private final com.healthguard.admin.medicine.service.MedicineForecastService forecastService;
    private final com.healthguard.admin.medicine.repository.MedicineDemandForecastRepository forecastRepository;
    private final com.healthguard.admin.medicine.repository.MedicineOrderRepository orderRepository;
    private final com.healthguard.admin.pharmacist.service.PharmacistService pharmacistService;

    @GetMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<com.healthguard.admin.pharmacist.dto.PharmacistProfileResponse>> getPharmacistProfile(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = queryEmail;
        if (email == null || email.isBlank()) {
            if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
                email = authentication.getName();
            } else {
                email = request.getHeader("X-User-Email");
            }
        }
        com.healthguard.admin.pharmacist.dto.PharmacistProfileResponse profile = pharmacistService.getPharmacistProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<com.healthguard.admin.pharmacist.dto.PharmacistProfileResponse>> updatePharmacistProfile(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @jakarta.validation.Valid @RequestBody com.healthguard.admin.pharmacist.dto.UpdatePharmacistProfileRequest updateRequest
    ) {
        String email = queryEmail;
        if (email == null || email.isBlank()) {
            if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
                email = authentication.getName();
            } else {
                email = request.getHeader("X-User-Email");
            }
        }
        if (email == null || email.isBlank()) {
            email = updateRequest.getEmail();
        }
        com.healthguard.admin.pharmacist.dto.PharmacistProfileResponse profile = pharmacistService.updatePharmacistProfile(email, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Pharmacist profile updated successfully", profile));
    }

    private String resolveEmail(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            String queryEmail
    ) {
        String email = queryEmail;
        if (email == null || email.isBlank()) {
            if (authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")) {
                email = authentication.getName();
            } else if (request != null) {
                email = request.getHeader("X-User-Email");
            }
        }
        return (email != null && !email.isBlank()) ? email.trim() : "717824f326@kce.ac.in";
    }

    @GetMapping("/settings/notifications")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse> getNotificationSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse response = pharmacistService.getNotificationSettings(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/notifications")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse> updateNotificationSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @RequestBody com.healthguard.admin.pharmacist.dto.UpdateNotificationSettingsRequest updateRequest
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistNotificationSettingsResponse response = pharmacistService.updateNotificationSettings(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/settings/dashboard")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse> getDashboardSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse response = pharmacistService.getDashboardSettings(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/dashboard")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse> updateDashboardSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @RequestBody com.healthguard.admin.pharmacist.dto.UpdateDashboardSettingsRequest updateRequest
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistDashboardSettingsResponse response = pharmacistService.updateDashboardSettings(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/settings/expiry-threshold")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse> getExpiryThresholdSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse response = pharmacistService.getExpiryThreshold(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/expiry-threshold")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse> updateExpiryThresholdSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @RequestBody com.healthguard.admin.pharmacist.dto.UpdateExpiryThresholdRequest updateRequest
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistExpiryThresholdResponse response = pharmacistService.updateExpiryThreshold(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/settings/appearance")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse> getAppearanceSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse response = pharmacistService.getAppearanceSettings(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/appearance")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse> updateAppearanceSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @RequestBody com.healthguard.admin.pharmacist.dto.UpdateAppearanceSettingsRequest updateRequest
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistAppearanceSettingsResponse response = pharmacistService.updateAppearanceSettings(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/settings/language")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse> getLanguageSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse response = pharmacistService.getLanguageSettings(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/settings/language")
    public ResponseEntity<com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse> updateLanguageSettings(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail,
            @RequestBody com.healthguard.admin.pharmacist.dto.UpdateLanguageSettingsRequest updateRequest
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        com.healthguard.admin.pharmacist.dto.PharmacistLanguageSettingsResponse response = pharmacistService.updateLanguageSettings(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            org.springframework.security.core.Authentication authentication,
            jakarta.servlet.http.HttpServletRequest request,
            @RequestParam(value = "email", required = false) String queryEmail
    ) {
        String email = resolveEmail(authentication, request, queryEmail);
        int expiryThreshold = pharmacistService.getExpiryWarningThreshold(email);

        List<Medicine> medicines = medicineRepository.findAll();
        long totalMedicines = medicines.size();

        // Requirement 5 & 14: Low stock alerts use medicine_demand_forecasts (risk_level = 'CRITICAL' OR estimated_days_of_stock_remaining < 15)
        long lowStockMedicines = forecastRepository.findLowStockAlerts().size();

        // Requirement 6 & 15: Out of stock uses quantity <= 0
        long outOfStockMedicines = medicineRepository.findByQuantityLessThanEqual(0).size();

        // Expiry risk alerts based on dynamic threshold (30, 60, 90 days)
        LocalDate today = LocalDate.now();
        long expiringMedicines = medicineRepository.findByExpiryDateBetween(today, today.plusDays(expiryThreshold)).size();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalMedicines", totalMedicines);
        dashboard.put("lowStockMedicines", lowStockMedicines);
        dashboard.put("outOfStockMedicines", outOfStockMedicines);
        dashboard.put("expiringMedicines", expiringMedicines);
        dashboard.put("expiryWarningThreshold", expiryThreshold);
        dashboard.put("pendingPrescriptionRequests", 0);

        return ResponseEntity.ok(ApiResponse.success("Pharmacist dashboard retrieved successfully", dashboard));
    }

    @GetMapping("/medicines")
    public ResponseEntity<?> getMedicines(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "manufacturer", required = false) String manufacturer
    ) {
        List<Medicine> list = medicineRepository.findAll();

        List<Medicine> filtered = list.stream()
                .filter(m -> search == null || (m.getName() != null && m.getName().toLowerCase().contains(search.toLowerCase())) || (m.getMedicineName() != null && m.getMedicineName().toLowerCase().contains(search.toLowerCase())))
                .filter(m -> category == null || category.equalsIgnoreCase("All") || (m.getCategory() != null && category.equalsIgnoreCase(m.getCategory())))
                .filter(m -> manufacturer == null || (m.getManufacturer() != null && m.getManufacturer().toLowerCase().contains(manufacturer.toLowerCase())))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/medicines")
    public ResponseEntity<?> addMedicine(@RequestBody Medicine medicine) {
        if (medicine.getMinStockThreshold() == null) {
            medicine.setMinStockThreshold(10);
        }
        if (medicine.getMedicineCode() == null || medicine.getMedicineCode().isBlank()) {
            medicine.setMedicineCode("MED-" + (System.currentTimeMillis() % 1000000));
        }
        if (medicine.getMedicineName() == null && medicine.getName() != null) {
            medicine.setMedicineName(medicine.getName());
        }
        if (medicine.getName() == null && medicine.getMedicineName() != null) {
            medicine.setName(medicine.getMedicineName());
        }
        Medicine saved = medicineRepository.save(medicine);
        auditLogService.logAction("MEDICINE_CREATED", "PHARMACIST", "Created medicine: " + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + " (ID: " + saved.getId() + ")");
        if (saved.getQuantity() != null && saved.getMinStockThreshold() != null && saved.getQuantity() <= saved.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + " (Qty: " + saved.getQuantity() + ")");
        }

        // Requirement 5 & 9: Automatically execute ML forecast refresh asynchronously
        forecastRefreshService.refreshMedicineForecastAsync(saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/medicines/{id}")
    public ResponseEntity<?> updateMedicine(@PathVariable("id") Long id, @RequestBody Medicine changes) {
        Optional<Medicine> opt = medicineRepository.findById(id);
        Medicine m;
        if (opt.isEmpty()) {
            m = changes != null ? changes : new Medicine();
            m.setId(id);
            if (m.getMedicineCode() == null) m.setMedicineCode("MED-" + (1000 + id));
            if (m.getMedicineName() == null && m.getName() != null) m.setMedicineName(m.getName());
            if (m.getName() == null && m.getMedicineName() != null) m.setName(m.getMedicineName());
            if (m.getName() == null) m.setName("Medicine " + id);
            if (m.getCategory() == null) m.setCategory("General");
            if (m.getQuantity() == null) m.setQuantity(0);
        } else {
            m = opt.get();
            if (changes.getName() != null) {
                m.setName(changes.getName());
                m.setMedicineName(changes.getName());
            }
            if (changes.getMedicineName() != null) {
                m.setMedicineName(changes.getMedicineName());
                if (m.getName() == null) m.setName(changes.getMedicineName());
            }
            if (changes.getCategory() != null) m.setCategory(changes.getCategory());
            if (changes.getManufacturer() != null) m.setManufacturer(changes.getManufacturer());
            if (changes.getBatchNumber() != null) m.setBatchNumber(changes.getBatchNumber());
            if (changes.getQuantity() != null) m.setQuantity(changes.getQuantity());
            if (changes.getUnit() != null) m.setUnit(changes.getUnit());
            if (changes.getPrice() != null) m.setPrice(changes.getPrice());
            if (changes.getExpiryDate() != null) m.setExpiryDate(changes.getExpiryDate());
            if (changes.getDescription() != null) m.setDescription(changes.getDescription());
            if (changes.getMinStockThreshold() != null) m.setMinStockThreshold(changes.getMinStockThreshold());
        }

        Medicine saved = medicineRepository.save(m);
        auditLogService.logAction("MEDICINE_UPDATED", "PHARMACIST", "Updated medicine ID: " + id + " (" + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + ")");
        if (saved.getQuantity() != null && saved.getMinStockThreshold() != null && saved.getQuantity() <= saved.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + " (Qty: " + saved.getQuantity() + ")");
        }

        // Requirement 6 & 9: Automatically execute ML forecast refresh asynchronously on update
        forecastRefreshService.refreshMedicineForecastAsync(saved.getId());

        return ResponseEntity.ok(saved);
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/medicines/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable("id") Long id) {
        if (!medicineRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Medicine not found with ID: " + id));
        }
        medicineRepository.deleteById(id);
        auditLogService.logAction("MEDICINE_DELETED", "PHARMACIST", "Deleted medicine ID: " + id);

        // Requirement 7: Automatically remove forecast and associated alerts on delete
        forecastRefreshService.removeMedicineForecast(id);

        return ResponseEntity.ok(Map.of("id", id, "deleted", true, "success", true));
    }

    @PostMapping("/stock/in")
    public ResponseEntity<?> stockIn(@RequestBody Map<String, Object> body) {
        Long medicineId = Long.valueOf(body.get("medicineId").toString());
        Integer qty = Integer.valueOf(body.get("quantity").toString());

        Optional<Medicine> opt = medicineRepository.findById(medicineId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Medicine not found");

        Medicine m = opt.get();
        m.setQuantity((m.getQuantity() != null ? m.getQuantity() : 0) + qty);
        Medicine saved = medicineRepository.save(m);

        auditLogService.logAction("MEDICINE_UPDATED", "PHARMACIST", "Stock-in (+ " + qty + ") for medicine: " + saved.getName() + " (ID: " + medicineId + ", New Qty: " + saved.getQuantity() + ")");
        if (saved.getQuantity() != null && saved.getMinStockThreshold() != null && saved.getQuantity() <= saved.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + saved.getName() + " (Qty: " + saved.getQuantity() + ")");
        }

        // Requirement 8 & 9: Refresh forecast immediately on Stock In
        forecastRefreshService.refreshMedicineForecastAsync(saved.getId());

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/stock/out")
    public ResponseEntity<?> stockOut(@RequestBody Map<String, Object> body) {
        Long medicineId = Long.valueOf(body.get("medicineId").toString());
        Integer qty = Integer.valueOf(body.get("quantity").toString());

        Optional<Medicine> opt = medicineRepository.findById(medicineId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Medicine not found");

        Medicine m = opt.get();
        int current = m.getQuantity() != null ? m.getQuantity() : 0;
        m.setQuantity(Math.max(0, current - qty));
        Medicine saved = medicineRepository.save(m);

        auditLogService.logAction("MEDICINE_UPDATED", "PHARMACIST", "Stock-out (- " + qty + ") for medicine: " + saved.getName() + " (ID: " + medicineId + ", New Qty: " + saved.getQuantity() + ")");
        if (saved.getQuantity() != null && saved.getMinStockThreshold() != null && saved.getQuantity() <= saved.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + saved.getName() + " (Qty: " + saved.getQuantity() + ", Min Threshold: " + saved.getMinStockThreshold() + ")");
        }

        try {
            com.healthguard.admin.medicine.entity.MedicineUsageHistory usage = com.healthguard.admin.medicine.entity.MedicineUsageHistory.builder()
                    .medicineId(medicineId)
                    .medicineName(saved.getMedicineName() != null ? saved.getMedicineName() : saved.getName())
                    .quantityUsed(qty)
                    .disease(body.get("disease") != null ? body.get("disease").toString() : "Prescription Dispense")
                    .village(body.get("village") != null ? body.get("village").toString() : "Bhubaneswar")
                    .usageDate(LocalDate.now())
                    .build();
            usageHistoryRepository.save(usage);
        } catch (Exception ignored) {}

        // Requirement 9: Refresh forecast immediately on Stock Out
        forecastRefreshService.refreshMedicineForecastAsync(saved.getId());

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/stock/low")
    public ResponseEntity<?> getLowStock() {
        // Requirement 5: Low Stock Alerts card must query medicine_demand_forecast where risk_level = 'CRITICAL' OR estimated_days_of_stock_remaining < 15
        List<com.healthguard.admin.medicine.entity.MedicineDemandForecast> lowStockForecasts = forecastRepository.findLowStockAlerts();
        return ResponseEntity.ok(lowStockForecasts);
    }

    @GetMapping("/stock/out-of-stock")
    public ResponseEntity<?> getOutOfStock() {
        // Requirement 6: Out Of Stock card must query inventory table: quantity = 0
        List<Medicine> list = medicineRepository.findByQuantityLessThanEqual(0);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/stock/expired")
    public ResponseEntity<?> getExpired() {
        // Requirement 7: Expired card must query expiry_date < CURRENT_DATE
        List<Medicine> list = medicineRepository.findByExpiryDateBefore(LocalDate.now());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/stock/expiring")
    public ResponseEntity<?> getExpiring() {
        int threshold = pharmacistService.getExpiryWarningThreshold(null);
        LocalDate now = LocalDate.now();
        List<Medicine> list = medicineRepository.findByExpiryDateBetween(now, now.plusDays(threshold));
        return ResponseEntity.ok(list);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<?> getPrescriptions(@RequestParam(value = "status", required = false) String status) {
        List<Prescription> list = prescriptionRepository.findAll();
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(p -> status.equalsIgnoreCase(p.getStatus())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(list);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @GetMapping({"/reports/{reportType}", "/reports"})
    public ResponseEntity<?> getReport(
            @PathVariable(value = "reportType", required = false) String reportType,
            @RequestParam(value = "type", required = false) String paramType
    ) {
        String type = (reportType != null ? reportType : (paramType != null ? paramType : "inventory")).toLowerCase();
        LocalDate today = LocalDate.now();

        switch (type) {
            case "inventory": {
                List<Medicine> medicines = medicineRepository.findAll();
                long totalMedicines = medicines.size();
                long lowStockCount = medicines.stream()
                        .filter(m -> m.getQuantity() != null && m.getQuantity() > 0 && m.getQuantity() <= (m.getMinStockThreshold() != null ? m.getMinStockThreshold() : 10))
                        .count();
                long outOfStockCount = medicines.stream()
                        .filter(m -> m.getQuantity() == null || m.getQuantity() <= 0)
                        .count();
                long inStockCount = medicines.stream()
                        .filter(m -> m.getQuantity() != null && m.getQuantity() > (m.getMinStockThreshold() != null ? m.getMinStockThreshold() : 10))
                        .count();
                long totalStockUnits = medicines.stream()
                        .mapToLong(m -> m.getQuantity() != null ? m.getQuantity() : 0)
                        .sum();

                Map<String, Long> categoryBreakdown = medicines.stream()
                        .collect(Collectors.groupingBy(m -> m.getCategory() != null ? m.getCategory() : "General", Collectors.counting()));

                List<Map<String, Object>> lowStockList = medicines.stream()
                        .filter(m -> m.getQuantity() != null && m.getQuantity() > 0 && m.getQuantity() <= (m.getMinStockThreshold() != null ? m.getMinStockThreshold() : 10))
                        .map(m -> {
                            Map<String, Object> item = new HashMap<>();
                            item.put("id", m.getId());
                            item.put("name", m.getName() != null ? m.getName() : m.getMedicineName());
                            item.put("category", m.getCategory());
                            item.put("batchNumber", m.getBatchNumber());
                            item.put("quantity", m.getQuantity());
                            item.put("minStockThreshold", m.getMinStockThreshold());
                            return item;
                        })
                        .collect(Collectors.toList());

                List<Map<String, Object>> outOfStockList = medicines.stream()
                        .filter(m -> m.getQuantity() == null || m.getQuantity() <= 0)
                        .map(m -> {
                            Map<String, Object> item = new HashMap<>();
                            item.put("id", m.getId());
                            item.put("name", m.getName() != null ? m.getName() : m.getMedicineName());
                            item.put("category", m.getCategory());
                            item.put("batchNumber", m.getBatchNumber());
                            item.put("quantity", 0);
                            return item;
                        })
                        .collect(Collectors.toList());

                Map<String, Object> data = new HashMap<>();
                data.put("reportTitle", "Pharmacy Inventory & Stock Levels Report");
                data.put("reportType", "INVENTORY");
                data.put("generatedAt", LocalDateTime.now().toString());
                data.put("totalMedicines", totalMedicines);
                data.put("totalStockUnits", totalStockUnits);
                data.put("inStockCount", inStockCount);
                data.put("lowStockCount", lowStockCount);
                data.put("outOfStockCount", outOfStockCount);
                data.put("categoryBreakdown", categoryBreakdown);
                data.put("lowStockMedicines", lowStockList);
                data.put("outOfStockMedicines", outOfStockList);
                data.put("medicines", medicines.stream().limit(50).collect(Collectors.toList()));

                return ResponseEntity.ok(ApiResponse.success("Inventory report generated successfully", data));
            }

            case "expiry": {
                List<Medicine> allMeds = medicineRepository.findAll();
                List<Medicine> expired = allMeds.stream()
                        .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(today))
                        .collect(Collectors.toList());
                List<Medicine> expiring30 = allMeds.stream()
                        .filter(m -> m.getExpiryDate() != null && !m.getExpiryDate().isBefore(today) && !m.getExpiryDate().isAfter(today.plusDays(30)))
                        .collect(Collectors.toList());
                List<Medicine> expiring60 = allMeds.stream()
                        .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isAfter(today.plusDays(30)) && !m.getExpiryDate().isAfter(today.plusDays(60)))
                        .collect(Collectors.toList());

                Map<String, Object> data = new HashMap<>();
                data.put("reportTitle", "Medicine Expiry Risk & Batch Alert Report");
                data.put("reportType", "EXPIRY");
                data.put("generatedAt", LocalDateTime.now().toString());
                data.put("expiredCount", expired.size());
                data.put("expiring30DaysCount", expiring30.size());
                data.put("expiring60DaysCount", expiring60.size());
                data.put("expiredMedicines", expired);
                data.put("expiring30DaysMedicines", expiring30);
                data.put("expiring60DaysMedicines", expiring60);

                return ResponseEntity.ok(ApiResponse.success("Expiry alert report generated successfully", data));
            }

            case "procurement": {
                List<com.healthguard.admin.medicine.entity.MedicineOrder> allOrders = orderRepository.findAll();
                long totalOrders = allOrders.size();
                long pendingDeliveries = allOrders.stream()
                        .filter(o -> "PLACED".equalsIgnoreCase(o.getStatus()) || "APPROVED".equalsIgnoreCase(o.getStatus()) || "SHIPPED".equalsIgnoreCase(o.getStatus()))
                        .count();
                long completedDeliveries = allOrders.stream()
                        .filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus()))
                        .count();
                double totalSpend = allOrders.stream()
                        .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0.0)
                        .sum();

                Map<String, Map<String, Object>> supplierBreakdown = new HashMap<>();
                for (com.healthguard.admin.medicine.entity.MedicineOrder o : allOrders) {
                    String sup = o.getSupplierName() != null ? o.getSupplierName() : "General Supplier";
                    if (!supplierBreakdown.containsKey(sup)) {
                        Map<String, Object> init = new HashMap<>();
                        init.put("orderCount", 0L);
                        init.put("totalSpend", 0.0);
                        supplierBreakdown.put(sup, init);
                    }
                    Map<String, Object> cur = supplierBreakdown.get(sup);
                    cur.put("orderCount", ((Number) cur.get("orderCount")).longValue() + 1);
                    cur.put("totalSpend", ((Number) cur.get("totalSpend")).doubleValue() + (o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0.0));
                }

                List<Map<String, Object>> orderSummaries = allOrders.stream().limit(20).map(o -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", o.getId());
                    map.put("orderNumber", o.getOrderNumber());
                    map.put("supplierName", o.getSupplierName());
                    map.put("supplierContact", o.getSupplierContact());
                    map.put("supplierEmail", o.getSupplierEmail());
                    map.put("supplierAddress", o.getSupplierAddress());
                    map.put("orderDate", o.getOrderDate());
                    map.put("expectedDeliveryDate", o.getExpectedDeliveryDate());
                    map.put("actualDeliveryDate", o.getActualDeliveryDate());
                    map.put("status", o.getStatus());
                    map.put("totalItems", o.getTotalItems());
                    map.put("totalQuantity", o.getTotalQuantity());
                    map.put("totalAmount", o.getTotalAmount());
                    map.put("remarks", o.getRemarks());
                    map.put("createdBy", o.getCreatedBy());
                    map.put("createdAt", o.getCreatedAt());
                    return map;
                }).collect(Collectors.toList());

                Map<String, Object> data = new HashMap<>();
                data.put("reportTitle", "Pharmacy Procurement & Purchase Orders Report");
                data.put("reportType", "PROCUREMENT");
                data.put("generatedAt", LocalDateTime.now().toString());
                data.put("totalOrders", totalOrders);
                data.put("pendingDeliveries", pendingDeliveries);
                data.put("completedDeliveries", completedDeliveries);
                data.put("totalSpend", totalSpend);
                data.put("supplierBreakdown", supplierBreakdown);
                data.put("orders", orderSummaries);

                return ResponseEntity.ok(ApiResponse.success("Procurement report generated successfully", data));
            }

            default: {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Report type '" + type + "' is not supported. Supported pharmacist reports: inventory, expiry, procurement."));
            }
        }
    }

    @RequestMapping(value = "/referrals/**", method = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<?> blockPharmacistReferrals() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access Denied: PHC referral verification has been transferred to the Health Officer workspace."));
    }
}
