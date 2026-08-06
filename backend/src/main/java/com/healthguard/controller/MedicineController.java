package com.healthguard.controller;

import com.healthguard.dto.MedicineRequest;
import com.healthguard.dto.MedicineResponse;
import com.healthguard.service.MedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Medicine catalog CRUD, search, and filter endpoints.
 * <p>
 * Reads ({@code /medicines/**}) are not under "/admin/**", "/citizen/**",
 * etc. so they fall to the "anyRequest().authenticated()" rule in
 * {@code SecurityConfig} - reachable by any authenticated role. Writes
 * ({@code /admin/medicines/**}) are covered by the existing "/admin/**"
 * -&gt; ROLE_ADMIN matcher. No security configuration changes are needed
 * for this module.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Medicines", description = "Medicine catalog: create, update, delete, list, search, and filter")
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping("/medicines")
    @Operation(summary = "List all medicines")
    public ResponseEntity<List<MedicineResponse>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllMedicines());
    }

    @GetMapping("/medicines/{medicineId}")
    @Operation(summary = "Get medicine details by id")
    public ResponseEntity<MedicineResponse> getMedicineById(@PathVariable Long medicineId) {
        return ResponseEntity.ok(medicineService.getMedicineById(medicineId));
    }

    @GetMapping("/medicines/search")
    @Operation(summary = "Search and filter medicines",
            description = "Free-text search over name/manufacturer, optionally combined with an exact "
                    + "category match and an availability filter "
                    + "(IN_STOCK, LOW_STOCK, OUT_OF_STOCK, EXPIRED). Any parameter may be omitted.")
    public ResponseEntity<List<MedicineResponse>> searchMedicines(
            @Parameter(description = "Free-text match against medicine name or manufacturer")
            @RequestParam(required = false) String search,
            @Parameter(description = "Exact category match")
            @RequestParam(required = false) String category,
            @Parameter(description = "IN_STOCK, LOW_STOCK, OUT_OF_STOCK, or EXPIRED")
            @RequestParam(required = false) String availability) {
        return ResponseEntity.ok(medicineService.searchMedicines(search, category, availability));
    }

    @GetMapping("/medicines/category/{category}")
    @Operation(summary = "Filter medicines by category")
    public ResponseEntity<List<MedicineResponse>> getMedicinesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(medicineService.getMedicinesByCategory(category));
    }

    @GetMapping("/medicines/expiring")
    @Operation(summary = "Filter medicines by upcoming expiry",
            description = "Medicines expiring within the given number of days from today (default 30), "
                    + "ordered soonest-first.")
    public ResponseEntity<List<MedicineResponse>> getMedicinesByExpiry(
            @Parameter(description = "Number of days from today to look ahead")
            @RequestParam(required = false, defaultValue = "30") int days) {
        return ResponseEntity.ok(medicineService.getMedicinesByExpiry(days));
    }

    @GetMapping("/medicines/expired")
    @Operation(summary = "List medicines that have already expired")
    public ResponseEntity<List<MedicineResponse>> getExpiredMedicines() {
        return ResponseEntity.ok(medicineService.getExpiredMedicines());
    }

    @PostMapping("/admin/medicines")
    @Operation(summary = "Add a new medicine")
    public ResponseEntity<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.createMedicine(request));
    }

    @PutMapping("/admin/medicines/{medicineId}")
    @Operation(summary = "Update an existing medicine")
    public ResponseEntity<MedicineResponse> updateMedicine(@PathVariable Long medicineId,
                                                             @Valid @RequestBody MedicineRequest request) {
        return ResponseEntity.ok(medicineService.updateMedicine(medicineId, request));
    }

    @DeleteMapping("/admin/medicines/{medicineId}")
    @Operation(summary = "Delete a medicine")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long medicineId) {
        medicineService.deleteMedicine(medicineId);
        return ResponseEntity.noContent().build();
    }
}
