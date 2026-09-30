package com.healthguard.admin.controller;

import com.healthguard.admin.entity.Hospital;
import com.healthguard.admin.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<Hospital> createHospital(@jakarta.validation.Valid @RequestBody Hospital hospital) {
        Hospital created = hospitalService.createHospital(hospital);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/test")
    public String test() {
        return "Hospital Controller Working";
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<Hospital> updateHospital(@PathVariable("id") Long id, @jakarta.validation.Valid @RequestBody Hospital hospital) {
        Hospital updated = hospitalService.updateHospital(id, hospital);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEALTH_OFFICER')")
    public ResponseEntity<Void> deleteHospital(@PathVariable("id") Long id) {
        hospitalService.deleteHospital(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<?> getAllHospitals(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        if (page != null) {
            return ResponseEntity.ok(hospitalService.getAllHospitals(PageRequest.of(page, size)));
        }
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(hospitalService.getHospitalById(id));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<Hospital>> getHospitalsByState(@PathVariable("state") String state) {
        return ResponseEntity.ok(hospitalService.getHospitalsByState(state));
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<Hospital>> getHospitalsByDistrict(@PathVariable("district") String district) {
        return ResponseEntity.ok(hospitalService.getHospitalsByDistrict(district));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchHospitals(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        if (page != null) {
            return ResponseEntity.ok(hospitalService.searchHospitals(query, PageRequest.of(page, size)));
        }
        return ResponseEntity.ok(hospitalService.searchHospitals(query));
    }
}

