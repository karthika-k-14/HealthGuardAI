package com.healthguard.controller;

import com.healthguard.dto.MedicineRequest;
import com.healthguard.dto.MedicineResponse;
import com.healthguard.dto.PharmacistDashboardResponse;
import com.healthguard.dto.PharmacyReportResponse;
import com.healthguard.dto.PrescriptionRequest;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.dto.PrescriptionStatusUpdateRequest;
import com.healthguard.dto.StockTransactionRequest;
import com.healthguard.dto.StockTransactionResponse;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.exception.BadRequestException;
import com.healthguard.security.UserPrincipal;
import com.healthguard.service.PharmacistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Pharmacist Module (Phase 4): dashboard summary, medicine inventory
 * CRUD/search, prescription verification/dispensing, manual stock
 * adjustments, and reports.
 * <p>
 * Every endpoint here requires an authenticated ROLE_PHARMACIST caller -
 * see the "/pharmacist/**" matcher added to {@code SecurityConfig}. Reuses
 * the same JWT security, exception handling, and DTO/mapper patterns as
 * the ASHA and Health Officer modules; no new auth logic is introduced.
 */
@RestController
@RequestMapping("/pharmacist")
@RequiredArgsConstructor
@Tag(name = "Pharmacist", description = "Pharmacist dashboard, medicine inventory, prescriptions, stock, and reports")
public class PharmacistController {

    private final PharmacistService pharmacistService;

    // ---- Dashboard -----------------------------------------------------

    @GetMapping("/dashboard")
    @Operation(summary = "Get the pharmacist dashboard summary",
            description = "Returns inventory counts (total/low/out-of-stock/expiring) plus today's prescription and dispensing activity.")
    public ResponseEntity<PharmacistDashboardResponse> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getDashboard());
    }

    // ---- Medicine inventory ---------------------------------------------

    @GetMapping("/medicines")
    @Operation(summary = "List/search/filter medicines in inventory")
    public ResponseEntity<List<MedicineResponse>> listMedicines(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Search by name or manufacturer") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by category") @RequestParam(required = false) String category,
            @Parameter(description = "Filter by manufacturer") @RequestParam(required = false) String manufacturer,
            @Parameter(description = "Filter by availability: IN_STOCK, LOW_STOCK, OUT_OF_STOCK, EXPIRED")
            @RequestParam(required = false) String availability) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.listMedicines(search, category, manufacturer, availability));
    }

    @GetMapping("/medicines/{id}")
    @Operation(summary = "Get one medicine by id")
    public ResponseEntity<MedicineResponse> getMedicine(@AuthenticationPrincipal UserPrincipal principal,
                                                          @PathVariable Long id) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getMedicine(id));
    }

    @PostMapping("/medicines")
    @Operation(summary = "Add a medicine to inventory")
    public ResponseEntity<MedicineResponse> addMedicine(@AuthenticationPrincipal UserPrincipal principal,
                                                          @Valid @RequestBody MedicineRequest request) {
        requirePharmacist(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacistService.addMedicine(request));
    }

    @PutMapping("/medicines/{id}")
    @Operation(summary = "Update a medicine")
    public ResponseEntity<MedicineResponse> updateMedicine(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable Long id,
                                                             @Valid @RequestBody MedicineRequest request) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.updateMedicine(id, request));
    }

    @DeleteMapping("/medicines/{id}")
    @Operation(summary = "Delete a medicine")
    public ResponseEntity<Void> deleteMedicine(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long id) {
        requirePharmacist(principal);
        pharmacistService.deleteMedicine(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Stock management -------------------------------------------------

    @PostMapping("/stock/in")
    @Operation(summary = "Record stock coming in for a medicine")
    public ResponseEntity<MedicineResponse> stockIn(@AuthenticationPrincipal UserPrincipal principal,
                                                      @Valid @RequestBody StockTransactionRequest request) {
        Pharmacist pharmacist = requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.stockIn(pharmacist, request));
    }

    @PostMapping("/stock/out")
    @Operation(summary = "Record stock going out for a medicine")
    public ResponseEntity<MedicineResponse> stockOut(@AuthenticationPrincipal UserPrincipal principal,
                                                       @Valid @RequestBody StockTransactionRequest request) {
        Pharmacist pharmacist = requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.stockOut(pharmacist, request));
    }

    @GetMapping("/stock/low")
    @Operation(summary = "List medicines currently at or below their low-stock threshold")
    public ResponseEntity<List<MedicineResponse>> getLowStock(@AuthenticationPrincipal UserPrincipal principal) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getLowStockMedicines());
    }

    @GetMapping("/stock/out-of-stock")
    @Operation(summary = "List medicines currently out of stock")
    public ResponseEntity<List<MedicineResponse>> getOutOfStock(@AuthenticationPrincipal UserPrincipal principal) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getOutOfStockMedicines());
    }

    @GetMapping("/stock/expired")
    @Operation(summary = "List medicines already past their expiry date")
    public ResponseEntity<List<MedicineResponse>> getExpired(@AuthenticationPrincipal UserPrincipal principal) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getExpiredMedicines());
    }

    @GetMapping("/stock/expiring")
    @Operation(summary = "List medicines expiring within the next 60 days")
    public ResponseEntity<List<MedicineResponse>> getExpiring(@AuthenticationPrincipal UserPrincipal principal) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getExpiringMedicines());
    }

    @GetMapping("/stock/history")
    @Operation(summary = "List stock transaction history, optionally filtered to one medicine")
    public ResponseEntity<List<StockTransactionResponse>> getStockHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Optional medicine id to scope history to") @RequestParam(required = false) Long medicineId) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getStockHistory(medicineId));
    }

    // ---- Prescription management -------------------------------------------

    @GetMapping("/prescriptions")
    @Operation(summary = "List prescriptions, optionally filtered by status")
    public ResponseEntity<List<PrescriptionResponse>> listPrescriptions(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Filter by status: PENDING, VERIFIED, DISPENSED, REJECTED")
            @RequestParam(required = false) PrescriptionStatus status) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.listPrescriptions(status));
    }

    @GetMapping("/prescriptions/{id}")
    @Operation(summary = "Get one prescription by id")
    public ResponseEntity<PrescriptionResponse> getPrescription(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @PathVariable Long id) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.getPrescription(id));
    }

    @PostMapping("/prescriptions")
    @Operation(summary = "Submit a new prescription for verification")
    public ResponseEntity<PrescriptionResponse> submitPrescription(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @Valid @RequestBody PrescriptionRequest request) {
        requirePharmacist(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacistService.submitPrescription(request));
    }

    @PatchMapping("/prescriptions/{id}/verify")
    @Operation(summary = "Verify a pending prescription")
    public ResponseEntity<PrescriptionResponse> verifyPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request) {
        Pharmacist pharmacist = requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.verifyPrescription(pharmacist, id, request));
    }

    @PatchMapping("/prescriptions/{id}/dispense")
    @Operation(summary = "Dispense a verified prescription")
    public ResponseEntity<PrescriptionResponse> dispensePrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request) {
        Pharmacist pharmacist = requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.dispensePrescription(pharmacist, id, request));
    }

    @PatchMapping("/prescriptions/{id}/reject")
    @Operation(summary = "Reject a prescription")
    public ResponseEntity<PrescriptionResponse> rejectPrescription(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) PrescriptionStatusUpdateRequest request) {
        Pharmacist pharmacist = requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.rejectPrescription(pharmacist, id, request));
    }

    // ---- Reports ---------------------------------------------------------

    @GetMapping("/reports/{reportType}")
    @Operation(summary = "Generate a report",
            description = "reportType is one of: daily, weekly, monthly, usage (medicine usage report).")
    public ResponseEntity<PharmacyReportResponse> generateReport(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable String reportType) {
        requirePharmacist(principal);
        return ResponseEntity.ok(pharmacistService.generateReport(reportType));
    }

    // ---- Helpers -----------------------------------------------------

    /**
     * Every endpoint here is already restricted to ROLE_PHARMACIST by
     * {@code SecurityConfig}, so this cast should always succeed; the
     * explicit check just guards against that invariant ever changing
     * without also updating this controller.
     */
    private Pharmacist requirePharmacist(UserPrincipal principal) {
        if (principal.getUser() instanceof Pharmacist pharmacist) {
            return pharmacist;
        }
        throw new BadRequestException("Only pharmacists can access this resource");
    }
}
