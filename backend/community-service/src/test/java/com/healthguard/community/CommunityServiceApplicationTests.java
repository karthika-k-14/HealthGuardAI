package com.healthguard.community;

import com.healthguard.community.dto.*;
import com.healthguard.community.exception.DuplicateResourceException;
import com.healthguard.community.exception.ResourceNotFoundException;
import com.healthguard.community.service.ASHAWorkerService;
import com.healthguard.community.service.PHCService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CommunityServiceApplicationTests {

    @Autowired
    private ASHAWorkerService ashaWorkerService;

    @Autowired
    private PHCService phcService;

    private ASHAWorkerRequest workerRequest;
    private PHCRequest phcRequest;

    @BeforeEach
    void setUp() {
        workerRequest = ASHAWorkerRequest.builder()
                .workerId("ASHA-001")
                .fullName("Anita Sharma")
                .mobileNumber("9876543210")
                .email("anita.sharma@example.com")
                .district("Central")
                .village("Rampur")
                .qualification("Higher Secondary")
                .assignedPHC("PHC-101")
                .status("ACTIVE")
                .build();

        phcRequest = PHCRequest.builder()
                .phcCode("PHC-101")
                .name("Rampur Primary Health Centre")
                .district("Central")
                .address("Main Road, Rampur")
                .latitude(17.385043)
                .longitude(78.486671)
                .contactNumber("9876543211")
                .medicalOfficer("Dr. Suresh Kumar")
                .build();
    }

    @Test
    void contextLoads() {
        assertNotNull(ashaWorkerService);
        assertNotNull(phcService);
    }

    @Test
    @DisplayName("Create ASHA Worker - Success")
    void testCreateASHAWorkerSuccess() {
        ASHAWorkerResponse response = ashaWorkerService.createWorker(workerRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("ASHA-001", response.getWorkerId());
        assertEquals("Anita Sharma", response.getFullName());
    }

    @Test
    @DisplayName("Create ASHA Worker - Duplicate Worker ID Throws Exception")
    void testCreateASHAWorkerDuplicateWorkerId() {
        ashaWorkerService.createWorker(workerRequest);

        ASHAWorkerRequest duplicateRequest = ASHAWorkerRequest.builder()
                .workerId("ASHA-001")
                .fullName("Sunita Devi")
                .mobileNumber("9876543212")
                .email("sunita.devi@example.com")
                .district("Central")
                .village("Rampur")
                .build();

        assertThrows(DuplicateResourceException.class, () -> ashaWorkerService.createWorker(duplicateRequest));
    }

    @Test
    @DisplayName("Get ASHA Worker by ID - Success")
    void testGetASHAWorkerByIdSuccess() {
        ASHAWorkerResponse created = ashaWorkerService.createWorker(workerRequest);

        ASHAWorkerResponse fetched = ashaWorkerService.getWorkerById(created.getId());

        assertNotNull(fetched);
        assertEquals("Anita Sharma", fetched.getFullName());
    }

    @Test
    @DisplayName("Update ASHA Worker - Success")
    void testUpdateASHAWorkerSuccess() {
        ASHAWorkerResponse created = ashaWorkerService.createWorker(workerRequest);

        UpdateASHAWorkerRequest updateRequest = UpdateASHAWorkerRequest.builder()
                .fullName("Anita Sharma Updated")
                .village("Sunderpur")
                .build();

        ASHAWorkerResponse updated = ashaWorkerService.updateWorker(created.getId(), updateRequest);

        assertEquals("Anita Sharma Updated", updated.getFullName());
        assertEquals("Sunderpur", updated.getVillage());
    }

    @Test
    @DisplayName("Delete ASHA Worker - Success")
    void testDeleteASHAWorkerSuccess() {
        ASHAWorkerResponse created = ashaWorkerService.createWorker(workerRequest);

        ashaWorkerService.deleteWorker(created.getId());

        assertThrows(ResourceNotFoundException.class, () -> ashaWorkerService.getWorkerById(created.getId()));
    }

    @Test
    @DisplayName("Create PHC - Success")
    void testCreatePHCSuccess() {
        PHCResponse response = phcService.createPHC(phcRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("PHC-101", response.getPhcCode());
        assertEquals("Rampur Primary Health Centre", response.getName());
    }

    @Test
    @DisplayName("Get PHCs by District - Success")
    void testGetPHCsByDistrict() {
        phcService.createPHC(phcRequest);

        List<PHCResponse> phcs = phcService.getAllPHCs("Central");

        assertFalse(phcs.isEmpty());
        assertEquals(1, phcs.size());
    }
}
