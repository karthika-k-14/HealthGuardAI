package com.healthguard.service;

import com.healthguard.dto.MedicineRequest;
import com.healthguard.dto.MedicineResponse;
import com.healthguard.entity.Medicine;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.MedicineMapper;
import com.healthguard.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

/**
 * Business logic for the standalone Medicine catalog module
 * ({@code /medicines/**} for reads, {@code /admin/medicines/**} for
 * writes). Independent of the Pharmacist module's own inventory
 * workflow (stock transactions, prescriptions) - this service only
 * covers Medicine's own CRUD, search, and filtering.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedicineService {

    private static final int DEFAULT_MIN_STOCK_THRESHOLD = 20;

    private final MedicineRepository medicineRepository;
    private final MedicineMapper medicineMapper;

    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(medicineMapper::toResponse)
                .toList();
    }

    public MedicineResponse getMedicineById(Long medicineId) {
        return medicineMapper.toResponse(findMedicineOrThrow(medicineId));
    }

    /**
     * Combined search/filter over name or manufacturer (free-text),
     * category (exact match), and availability
     * ({@code IN_STOCK}/{@code LOW_STOCK}/{@code OUT_OF_STOCK}/{@code EXPIRED}).
     * Any parameter left blank/null is ignored, so this also serves plain
     * "filter by category" and "filter by availability" requests.
     */
    public List<MedicineResponse> searchMedicines(String search, String category, String availability) {
        String normalizedSearch = StringUtils.hasText(search) ? search.trim() : null;
        String normalizedCategory = StringUtils.hasText(category) ? category.trim() : null;
        String normalizedAvailability = StringUtils.hasText(availability) ? availability.trim().toUpperCase() : null;

        return medicineRepository.search(normalizedSearch, normalizedCategory, null, normalizedAvailability).stream()
                .map(medicineMapper::toResponse)
                .toList();
    }

    public List<MedicineResponse> getMedicinesByCategory(String category) {
        return medicineRepository.findByCategoryIgnoreCase(category).stream()
                .map(medicineMapper::toResponse)
                .toList();
    }

    /**
     * Medicines expiring within the next {@code days} days (inclusive of
     * today), ordered soonest-first. Also covers already-expired stock when
     * {@code days} is 0.
     */
    public List<MedicineResponse> getMedicinesByExpiry(int days) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(Math.max(days, 0));
        return medicineRepository.findExpiringBetween(today, end).stream()
                .map(medicineMapper::toResponse)
                .toList();
    }

    public List<MedicineResponse> getExpiredMedicines() {
        LocalDate today = LocalDate.now();
        return medicineRepository.findAll().stream()
                .filter(medicine -> medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(today))
                .map(medicineMapper::toResponse)
                .toList();
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
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
                .minStockThreshold(request.getMinStockThreshold() != null
                        ? request.getMinStockThreshold()
                        : DEFAULT_MIN_STOCK_THRESHOLD)
                .build();

        return medicineMapper.toResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public MedicineResponse updateMedicine(Long medicineId, MedicineRequest request) {
        Medicine medicine = findMedicineOrThrow(medicineId);

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

        return medicineMapper.toResponse(medicineRepository.save(medicine));
    }

    @Transactional
    public void deleteMedicine(Long medicineId) {
        Medicine medicine = findMedicineOrThrow(medicineId);
        medicineRepository.delete(medicine);
    }

    private Medicine findMedicineOrThrow(Long medicineId) {
        return medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + medicineId));
    }
}
