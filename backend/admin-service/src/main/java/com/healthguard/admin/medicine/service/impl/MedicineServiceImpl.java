package com.healthguard.admin.medicine.service.impl;

import com.healthguard.admin.exception.DuplicateResourceException;
import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.medicine.dto.MedicineRequest;
import com.healthguard.admin.medicine.dto.MedicineResponse;
import com.healthguard.admin.medicine.dto.UpdateMedicineRequest;
import com.healthguard.admin.medicine.entity.Medicine;
import com.healthguard.admin.medicine.repository.MedicineRepository;
import com.healthguard.admin.medicine.service.MedicineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final com.healthguard.admin.service.AuditLogService auditLogService;
    private final com.healthguard.admin.medicine.service.ForecastRefreshService forecastRefreshService;
    private final com.healthguard.admin.medicine.service.MedicineForecastService forecastService;

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.existsByMedicineCode(request.getMedicineCode())) {
            throw new DuplicateResourceException("Medicine already exists with Code: " + request.getMedicineCode());
        }

        String nameToUse = request.getName() != null ? request.getName() : request.getMedicineName();
        Medicine medicine = Medicine.builder()
                .medicineCode(request.getMedicineCode())
                .medicineName(request.getMedicineName() != null ? request.getMedicineName() : nameToUse)
                .name(nameToUse)
                .category(request.getCategory())
                .manufacturer(request.getManufacturer())
                .batchNumber(request.getBatchNumber())
                .expiryDate(request.getExpiryDate())
                .quantity(request.getQuantity())
                .unit(request.getUnit() != null ? request.getUnit() : "units")
                .price(request.getPrice())
                .description(request.getDescription())
                .minStockThreshold(request.getMinStockThreshold() != null ? request.getMinStockThreshold() : 10)
                .build();

        Medicine saved = medicineRepository.save(medicine);
        auditLogService.logAction("MEDICINE_CREATED", "PHARMACIST", "Created medicine: " + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + " (Code: " + saved.getMedicineCode() + ", Qty: " + saved.getQuantity() + ")");
        if (saved.getQuantity() != null && saved.getMinStockThreshold() != null && saved.getQuantity() <= saved.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + (saved.getName() != null ? saved.getName() : saved.getMedicineName()) + " (Qty: " + saved.getQuantity() + ", Min Threshold: " + saved.getMinStockThreshold() + ")");
        }
        try {
            forecastRefreshService.refreshMedicineForecastAsync(saved.getId());
        } catch (Exception e) {
            log.warn("Non-blocking error triggering async forecast refresh on create: {}", e.getMessage());
        }
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional
    public MedicineResponse updateMedicine(Long id, UpdateMedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));

        if (request.getMedicineName() != null) medicine.setMedicineName(request.getMedicineName());
        if (request.getName() != null) medicine.setName(request.getName());
        if (request.getCategory() != null) medicine.setCategory(request.getCategory());
        if (request.getManufacturer() != null) medicine.setManufacturer(request.getManufacturer());
        if (request.getBatchNumber() != null) medicine.setBatchNumber(request.getBatchNumber());
        if (request.getExpiryDate() != null) medicine.setExpiryDate(request.getExpiryDate());
        if (request.getQuantity() != null) medicine.setQuantity(request.getQuantity());
        if (request.getUnit() != null) medicine.setUnit(request.getUnit());
        if (request.getPrice() != null) medicine.setPrice(request.getPrice());
        if (request.getDescription() != null) medicine.setDescription(request.getDescription());
        if (request.getMinStockThreshold() != null) medicine.setMinStockThreshold(request.getMinStockThreshold());

        Medicine updated = medicineRepository.save(medicine);
        auditLogService.logAction("MEDICINE_UPDATED", "PHARMACIST", "Updated medicine ID: " + id + " (" + (updated.getName() != null ? updated.getName() : updated.getMedicineName()) + ", Qty: " + updated.getQuantity() + ")");
        if (updated.getQuantity() != null && updated.getMinStockThreshold() != null && updated.getQuantity() <= updated.getMinStockThreshold()) {
            auditLogService.logAction("LOW_STOCK_ALERT_GENERATED", "PHARMACIST", "Low stock alert generated for medicine: " + (updated.getName() != null ? updated.getName() : updated.getMedicineName()) + " (Qty: " + updated.getQuantity() + ", Min Threshold: " + updated.getMinStockThreshold() + ")");
        }
        try {
            forecastRefreshService.refreshMedicineForecastAsync(updated.getId());
        } catch (Exception e) {
            log.warn("Non-blocking error triggering async forecast refresh on update: {}", e.getMessage());
        }
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        forecastRefreshService.removeMedicineForecast(id);
        medicineRepository.delete(medicine);
        auditLogService.logAction("MEDICINE_DELETED", "PHARMACIST", "Deleted medicine ID: " + id + " (" + (medicine.getName() != null ? medicine.getName() : medicine.getMedicineName()) + ")");
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .medicineCode(medicine.getMedicineCode())
                .medicineName(medicine.getMedicineName())
                .name(medicine.getName())
                .category(medicine.getCategory())
                .manufacturer(medicine.getManufacturer())
                .batchNumber(medicine.getBatchNumber())
                .expiryDate(medicine.getExpiryDate())
                .quantity(medicine.getQuantity())
                .unit(medicine.getUnit())
                .price(medicine.getPrice())
                .description(medicine.getDescription())
                .minStockThreshold(medicine.getMinStockThreshold())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
}
