package com.healthguard.citizen;

import com.healthguard.citizen.dto.CitizenRequest;
import com.healthguard.citizen.dto.CitizenResponse;
import com.healthguard.citizen.dto.UpdateCitizenRequest;
import com.healthguard.citizen.exception.DuplicateResourceException;
import com.healthguard.citizen.exception.ResourceNotFoundException;
import com.healthguard.citizen.service.CitizenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CitizenServiceApplicationTests {

    @Autowired
    private CitizenService citizenService;

    private CitizenRequest testRequest;

    @BeforeEach
    void setUp() {
        testRequest = CitizenRequest.builder()
                .userId(101L)
                .fullName("John Doe")
                .gender("Male")
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .bloodGroup("O+")
                .mobileNumber("9876543210")
                .email("john.doe@example.com")
                .address("123 Health St")
                .district("Central")
                .state("Stateville")
                .pincode("500001")
                .preferredLanguage("English")
                .emergencyContactName("Jane Doe")
                .emergencyContactNumber("9876543211")
                .build();
    }

    @Test
    void contextLoads() {
        assertNotNull(citizenService);
    }

    @Test
    @DisplayName("Create Citizen - Success")
    void testCreateCitizenSuccess() {
        CitizenResponse response = citizenService.createCitizen(testRequest);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(101L, response.getUserId());
        assertEquals("John Doe", response.getFullName());
        assertEquals("john.doe@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Create Citizen - Duplicate User ID Throws Exception")
    void testCreateCitizenDuplicateUserId() {
        citizenService.createCitizen(testRequest);

        CitizenRequest duplicateRequest = CitizenRequest.builder()
                .userId(101L)
                .fullName("Jane Smith")
                .gender("Female")
                .dateOfBirth(LocalDate.of(1992, 8, 20))
                .bloodGroup("A+")
                .mobileNumber("9876543212")
                .email("jane.smith@example.com")
                .address("456 Care Ave")
                .district("North")
                .state("Stateville")
                .pincode("500002")
                .build();

        assertThrows(DuplicateResourceException.class, () -> citizenService.createCitizen(duplicateRequest));
    }

    @Test
    @DisplayName("Get Citizen by User ID - Success")
    void testGetCitizenByUserIdSuccess() {
        citizenService.createCitizen(testRequest);

        CitizenResponse response = citizenService.getCitizenByUserId(101L);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    @DisplayName("Get Citizen Profile by User ID - Success")
    void testGetCitizenProfileByUserIdSuccess() {
        citizenService.createCitizen(testRequest);

        CitizenResponse response = citizenService.getCitizenProfileByUserId(101L);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
    }

    @Test
    @DisplayName("Get Citizen by Non-Existent User ID Throws ResourceNotFoundException")
    void testGetCitizenNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> citizenService.getCitizenByUserId(999L));
    }

    @Test
    @DisplayName("Update Citizen - Success")
    void testUpdateCitizenSuccess() {
        citizenService.createCitizen(testRequest);

        UpdateCitizenRequest updateRequest = UpdateCitizenRequest.builder()
                .fullName("John Updated")
                .address("789 Wellness Blvd")
                .build();

        CitizenResponse updatedResponse = citizenService.updateCitizen(101L, updateRequest);

        assertNotNull(updatedResponse);
        assertEquals("John Updated", updatedResponse.getFullName());
        assertEquals("789 Wellness Blvd", updatedResponse.getAddress());
        assertEquals("john.doe@example.com", updatedResponse.getEmail());
    }

    @Test
    @DisplayName("Delete Citizen - Success")
    void testDeleteCitizenSuccess() {
        citizenService.createCitizen(testRequest);

        citizenService.deleteCitizen(101L);

        assertThrows(ResourceNotFoundException.class, () -> citizenService.getCitizenByUserId(101L));
    }
}
