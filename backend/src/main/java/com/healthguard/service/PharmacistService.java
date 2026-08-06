package com.healthguard.service;

import com.healthguard.dto.MedicineRequest;
import com.healthguard.dto.MedicineResponse;
import com.healthguard.dto.PharmacistDashboardResponse;
import com.healthguard.dto.PharmacyReportResponse;
import com.healthguard.dto.PrescriptionRequest;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.dto.PrescriptionStatusUpdateRequest;
import com.healthguard.dto.StockTransactionRequest;
import com.healthguard.dto.StockTransactionResponse;
import com.healthguard.entity.Medicine;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.entity.StockMovementType;
import com.healthguard.entity.StockTransaction;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.PharmacistMapper;
import com.healthguard.repository.MedicineRepository;
import com.healthguard.repository.PrescriptionRepository;
import com.healthguard.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Business logic for Phase 4 - the Pharmacist Module: dashboard summary,
 * medicine inventory CRUD/search, prescription verification/dispensing,
 * manual stock adjustments, and reports.
 * <p>
 * Every method here operates against the whole shared inventory rather
 * than data scoped to the calling pharmacist - the data model has a
 * single pharmacy inventory, not one per pharmacist - but every stock
 * movement and prescription action still records which pharmacist
 * performed it for audit purposes.
 */
@Service
@RequiredArgsConstructor
public class PharmacistService {

    private static final int EXPIRING_WINDOW_DAYS = 60;

    private final MedicineRepository medicineRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PharmacistMapper pharmacistMapper;

    // ---- Dashboard -----------------------------------------------------

    public PharmacistDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        return PharmacistDashboardResponse.builder()
                .totalMedicines(medicineRepository.count())
                .lowStockMedicines(medicineRepository.countLowStock())
                .outOfStockMedicines(medicineRepository.countByQuantityLessThanEqual(0))
                .expiringMedicines(medicineRepository.countExpiringBetween(today, today.plusDays(EXPIRING_WINDOW_DAYS)))
                .todaysPrescriptions(prescriptionRepository.countByCreatedAtBetween(startOfDay, endOfDay))
                .medicinesDispensedToday(
                        stockTransactionRepository.sumQuantityByTypeAndDateBetween(
                                StockMovementType.STOCK_OUT, startOfDay, endOfDay))
                .pendingPrescriptionRequests(prescriptionRepository.countByStatus(PrescriptionStatus.PENDING))
                .build();
    }

    // ---- Medicine inventory ---------------------------------------------

    public List<MedicineResponse> listMedicines(String search, String category, String manufacturer, String availability) {
        String normalizedAvailability = availability != null && !availability.equalsIgnoreCase("All")
                ? availability.trim().toUpperCase().replace(' ', '_')
                : null;
        String normalizedCategory = category != null && !category.equalsIgnoreCase("All") ? category : null;
        return medicineRepository.search(blankToNull(search), normalizedCategory, blankToNull(manufacturer), normalizedAvailability)
                .stream()
                .map(pharmacistMapper::toMedicineResponse)
                .toList();
    }

    public MedicineResponse getMedicine(Long id) {
        return pharmacistMapper.toMedicineResponse(findMedicine(id));
    }

    @Transactional
    public MedicineResponse addMedicine(MedicineRequest request) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .batchNumber(request.getBatchNumber())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .price(request.getPrice())
                .expiryDate(request.getExpiryDate())
                .description(request.getDescription())
                .minStockThreshold(request.getMinStockThreshold() != null ? request.getMinStockThreshold() : 20)
                .build();
        return pharmacistMapper.toMedicineResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = findMedicine(id);
        medicine.setName(request.getName());
        medicine.setCategory(request.getCategory());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setBatchNumber(request.getBatchNumber());
        medicine.setQuantity(request.getQuantity());
        medicine.setUnit(request.getUnit());
        medicine.setPrice(request.getPrice());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setDescription(request.getDescription());
        if (request.getMinStockThreshold() != null) {
            medicine.setMinStockThreshold(request.getMinStockThreshold());
        }
        return pharmacistMapper.toMedicineResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = findMedicine(id);
        medicineRepository.delete(medicine);
    }

    // ---- Stock management -------------------------------------------------

    @Transactional
    public MedicineResponse stockIn(Pharmacist pharmacist, StockTransactionRequest request) {
        Medicine medicine = findMedicine(request.getMedicineId());
        medicine.setQuantity(medicine.getQuantity() + request.getQuantity());
        medicineRepository.save(medicine);
        recordTransaction(pharmacist, medicine, StockMovementType.STOCK_IN, request.getQuantity(), request.getReason());
        return pharmacistMapper.toMedicineResponse(medicine);
    }

    @Transactional
    public MedicineResponse stockOut(Pharmacist pharmacist, StockTransactionRequest request) {
        Medicine medicine = findMedicine(request.getMedicineId());
        if (medicine.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock for " + medicine.getName()
                    + " - available: " + medicine.getQuantity());
        }
        medicine.setQuantity(medicine.getQuantity() - request.getQuantity());
        medicineRepository.save(medicine);
        recordTransaction(pharmacist, medicine, StockMovementType.STOCK_OUT, request.getQuantity(), request.getReason());
        return pharmacistMapper.toMedicineResponse(medicine);
    }

    public List<MedicineResponse> getLowStockMedicines() {
        return medicineRepository.findLowStock().stream().map(pharmacistMapper::toMedicineResponse).toList();
    }

    public List<MedicineResponse> getOutOfStockMedicines() {
        return medicineRepository.findOutOfStock().stream().map(pharmacistMapper::toMedicineResponse).toList();
    }

    public List<MedicineResponse> getExpiredMedicines() {
        return medicineRepository.findAll().stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(LocalDate.now()))
                .map(pharmacistMapper::toMedicineResponse)
                .toList();
    }

    public List<MedicineResponse> getExpiringMedicines() {
        LocalDate today = LocalDate.now();
        return medicineRepository.findExpiringBetween(today, today.plusDays(EXPIRING_WINDOW_DAYS)).stream()
                .map(pharmacistMapper::toMedicineResponse)
                .toList();
    }

    public List<StockTransactionResponse> getStockHistory(Long medicineId) {
        List<StockTransaction> transactions = medicineId != null
                ? stockTransactionRepository.findByMedicineIdOrderByTransactionDateDesc(medicineId)
                : stockTransactionRepository.findByOrderByTransactionDateDesc();
        return transactions.stream().map(pharmacistMapper::toStockTransactionResponse).toList();
    }

    // ---- Prescription management -------------------------------------------

    public List<PrescriptionResponse> listPrescriptions(PrescriptionStatus status) {
        List<Prescription> prescriptions = status != null
                ? prescriptionRepository.findByStatusOrderByCreatedAtDesc(status)
                : prescriptionRepository.findByOrderByCreatedAtDesc();
        return prescriptions.stream().map(pharmacistMapper::toPrescriptionResponse).toList();
    }

    public PrescriptionResponse getPrescription(Long id) {
        return pharmacistMapper.toPrescriptionResponse(findPrescription(id));
    }

    @Transactional
    public PrescriptionResponse submitPrescription(PrescriptionRequest request) {
        Prescription prescription = Prescription.builder()
                .patientName(request.getPatientName())
                .patientAge(request.getPatientAge())
                .referredBy(request.getReferredBy())
                .medicines(pharmacistMapper.joinMedicines(request.getMedicines()))
                .status(PrescriptionStatus.PENDING)
                .notes(request.getNotes())
                .build();
        return pharmacistMapper.toPrescriptionResponse(prescriptionRepository.save(prescription));
    }

    @Transactional
    public PrescriptionResponse verifyPrescription(Pharmacist pharmacist, Long id, PrescriptionStatusUpdateRequest request) {
        Prescription prescription = findPrescription(id);
        if (prescription.getStatus() != PrescriptionStatus.PENDING) {
            throw new BadRequestException("Only a pending prescription can be verified");
        }
        prescription.setStatus(PrescriptionStatus.VERIFIED);
        prescription.setHandledBy(pharmacist);
        prescription.setVerifiedAt(LocalDateTime.now());
        if (request != null && request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }
        return pharmacistMapper.toPrescriptionResponse(prescriptionRepository.save(prescription));
    }

    @Transactional
    public PrescriptionResponse rejectPrescription(Pharmacist pharmacist, Long id, PrescriptionStatusUpdateRequest request) {
        Prescription prescription = findPrescription(id);
        if (prescription.getStatus() == PrescriptionStatus.DISPENSED) {
            throw new BadRequestException("A dispensed prescription cannot be rejected");
        }
        prescription.setStatus(PrescriptionStatus.REJECTED);
        prescription.setHandledBy(pharmacist);
        if (request != null && request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }
        return pharmacistMapper.toPrescriptionResponse(prescriptionRepository.save(prescription));
    }

    /**
     * Dispensing a prescription records a best-effort stock-out
     * transaction for each prescribed medicine name that matches an
     * existing inventory item by name (case-insensitive); unmatched
     * names are simply skipped since this platform has no dedicated
     * prescription-line-item -> inventory-item mapping.
     */
    @Transactional
    public PrescriptionResponse dispensePrescription(Pharmacist pharmacist, Long id, PrescriptionStatusUpdateRequest request) {
        Prescription prescription = findPrescription(id);
        if (prescription.getStatus() != PrescriptionStatus.VERIFIED) {
            throw new BadRequestException("Only a verified prescription can be dispensed");
        }
        List<Medicine> allMedicines = medicineRepository.findAll();
        for (String rawName : prescription.getMedicines().split(",")) {
            String name = rawName.trim();
            if (name.isEmpty()) {
                continue;
            }
            allMedicines.stream()
                    .filter(m -> m.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .ifPresent(medicine -> {
                        int qty = Math.min(1, Math.max(0, medicine.getQuantity()));
                        if (qty > 0) {
                            medicine.setQuantity(medicine.getQuantity() - qty);
                            medicineRepository.save(medicine);
                            recordTransaction(pharmacist, medicine, StockMovementType.STOCK_OUT, qty,
                                    "Dispensed for prescription #" + prescription.getId());
                        }
                    });
        }
        prescription.setStatus(PrescriptionStatus.DISPENSED);
        prescription.setHandledBy(pharmacist);
        prescription.setDispensedAt(LocalDateTime.now());
        if (request != null && request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }
        return pharmacistMapper.toPrescriptionResponse(prescriptionRepository.save(prescription));
    }

    // ---- Reports ---------------------------------------------------------

    public PharmacyReportResponse generateReport(String reportType) {
        LocalDate today = LocalDate.now();
        LocalDate periodStart = switch (reportType.toLowerCase()) {
            case "weekly" -> today.minusDays(6);
            case "monthly" -> today.minusDays(29);
            case "usage" -> today.minusDays(29);
            default -> today;
        };
        LocalDateTime start = periodStart.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);

        Map<String, Long> medicineUsage = new LinkedHashMap<>();
        for (Object[] row : stockTransactionRepository.sumQuantityByMedicineNameForTypeAndDateBetween(
                StockMovementType.STOCK_OUT, start, end)) {
            medicineUsage.put((String) row[0], ((Number) row[1]).longValue());
        }

        return PharmacyReportResponse.builder()
                .reportType(reportType)
                .generatedAt(LocalDateTime.now())
                .periodStart(periodStart)
                .periodEnd(today)
                .medicinesStockedIn(stockTransactionRepository.sumQuantityByTypeAndDateBetween(
                        StockMovementType.STOCK_IN, start, end))
                .medicinesStockedOut(stockTransactionRepository.sumQuantityByTypeAndDateBetween(
                        StockMovementType.STOCK_OUT, start, end))
                .prescriptionsVerified(prescriptionRepository.countByStatus(PrescriptionStatus.VERIFIED))
                .prescriptionsDispensed(prescriptionRepository.countByStatusAndDispensedAtBetween(
                        PrescriptionStatus.DISPENSED, start, end))
                .totalMedicines(medicineRepository.count())
                .lowStockMedicines(medicineRepository.countLowStock())
                .outOfStockMedicines(medicineRepository.countByQuantityLessThanEqual(0))
                .medicineUsage(medicineUsage)
                .build();
    }

    // ---- Helpers -----------------------------------------------------

    private void recordTransaction(Pharmacist pharmacist, Medicine medicine, StockMovementType type,
                                    int quantity, String reason) {
        StockTransaction transaction = StockTransaction.builder()
                .medicine(medicine)
                .movementType(type)
                .quantity(quantity)
                .reason(reason)
                .performedBy(pharmacist)
                .transactionDate(LocalDateTime.now())
                .build();
        stockTransactionRepository.save(transaction);
    }

    private Medicine findMedicine(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    private Prescription findPrescription(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found: " + id));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
