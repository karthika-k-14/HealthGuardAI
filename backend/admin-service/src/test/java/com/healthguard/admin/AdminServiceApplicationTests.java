package com.healthguard.admin;

import com.healthguard.admin.admin.dto.DashboardSummaryResponse;
import com.healthguard.admin.admin.service.AdminService;
import com.healthguard.admin.healthofficer.dto.HealthOfficerRequest;
import com.healthguard.admin.healthofficer.dto.HealthOfficerResponse;
import com.healthguard.admin.healthofficer.service.HealthOfficerService;
import com.healthguard.admin.medicine.dto.MedicineRequest;
import com.healthguard.admin.medicine.dto.MedicineResponse;
import com.healthguard.admin.medicine.service.MedicineService;
import com.healthguard.admin.pharmacist.dto.PharmacistRequest;
import com.healthguard.admin.pharmacist.dto.PharmacistResponse;
import com.healthguard.admin.pharmacist.service.PharmacistService;
import com.healthguard.admin.prescription.dto.PrescriptionRequest;
import com.healthguard.admin.prescription.dto.PrescriptionResponse;
import com.healthguard.admin.prescription.service.PrescriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminServiceApplicationTests {

    @Autowired
    private AdminService adminService;

    @Autowired
    private HealthOfficerService healthOfficerService;

    @Autowired
    private PharmacistService pharmacistService;

    @Autowired
    private MedicineService medicineService;

    @Autowired
    private PrescriptionService prescriptionService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void contextLoads() {
        assertNotNull(adminService);
        assertNotNull(healthOfficerService);
        assertNotNull(pharmacistService);
        assertNotNull(medicineService);
        assertNotNull(prescriptionService);
    }

    @Test
    @DisplayName("Admin Dashboard Summary - Success")
    void testGetDashboardSummary() {
        DashboardSummaryResponse summary = adminService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals("HEALTHY", summary.getSystemStatus());
    }

    @Test
    @DisplayName("Health Officer CRUD - Success")
    void testHealthOfficerCrud() {
        HealthOfficerRequest request = HealthOfficerRequest.builder()
                .officerId("HO-001")
                .fullName("Dr. Rajesh Varma")
                .email("rajesh.varma@example.com")
                .mobileNumber("9876543210")
                .district("Central")
                .designation("District Health Officer")
                .status("ACTIVE")
                .build();

        HealthOfficerResponse created = healthOfficerService.createOfficer(request);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("HO-001", created.getOfficerId());

        HealthOfficerResponse fetched = healthOfficerService.getOfficerById(created.getId());
        assertEquals("Dr. Rajesh Varma", fetched.getFullName());
    }

    @Test
    @DisplayName("Pharmacist CRUD - Success")
    void testPharmacistCrud() {
        PharmacistRequest request = PharmacistRequest.builder()
                .pharmacistId("PHARM-001")
                .fullName("Srinivas Rao")
                .email("srinivas.rao@example.com")
                .mobileNumber("9876543211")
                .pharmacyName("Central Health Pharmacy")
                .licenseNumber("LIC-123456")
                .status("ACTIVE")
                .build();

        PharmacistResponse created = pharmacistService.createPharmacist(request);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("PHARM-001", created.getPharmacistId());
    }

    @Test
    @DisplayName("Medicine CRUD - Success")
    void testMedicineCrud() {
        MedicineRequest request = MedicineRequest.builder()
                .medicineCode("MED-PAR-500")
                .medicineName("Paracetamol 500mg")
                .category("Analgesic / Antipyretic")
                .manufacturer("PharmaCorp")
                .batchNumber("BATCH-2026-A")
                .expiryDate(LocalDate.now().plusYears(2))
                .quantity(100)
                .price(new BigDecimal("15.50"))
                .build();

        MedicineResponse created = medicineService.createMedicine(request);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals("MED-PAR-500", created.getMedicineCode());
    }

    @Test
    @DisplayName("Prescription CRUD - Success")
    void testPrescriptionCrud() {
        PrescriptionRequest request = PrescriptionRequest.builder()
                .citizenId(101L)
                .doctorName("Dr. Sarah Jenkins")
                .medicineName("Paracetamol 500mg")
                .dosage("1 tablet every 8 hours")
                .duration("5 days")
                .status("ACTIVE")
                .build();

        PrescriptionResponse created = prescriptionService.createPrescription(request);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertEquals(101L, created.getCitizenId());
    }
}
