package com.healthguard.admin.service;

import com.healthguard.admin.entity.Hospital;
import com.healthguard.admin.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    @Transactional
    public Hospital createHospital(Hospital hospital) {
        if (hospital.getState() == null || hospital.getState().isBlank()) {
            hospital.setState("Odisha");
        }
        if (hospital.getDistrict() == null || hospital.getDistrict().isBlank()) {
            hospital.setDistrict("Khurda");
        }
        if (hospital.getHospitalType() == null || hospital.getHospitalType().isBlank()) {
            hospital.setHospitalType("Government");
        }
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public Hospital updateHospital(Long id, Hospital details) {
        Hospital hospital = getHospitalById(id);
        if (details.getName() != null && !details.getName().isBlank()) {
            hospital.setName(details.getName());
        }
        if (details.getAddress() != null) {
            hospital.setAddress(details.getAddress());
        }
        if (details.getDistrict() != null) {
            hospital.setDistrict(details.getDistrict());
        }
        if (details.getState() != null) {
            hospital.setState(details.getState());
        }
        if (details.getContactNumber() != null) {
            hospital.setContactNumber(details.getContactNumber());
        }
        if (details.getHospitalType() != null) {
            hospital.setHospitalType(details.getHospitalType());
        }
        if (details.getBeds() != null) {
            hospital.setBeds(details.getBeds());
        }
        if (details.getStatus() != null) {
            hospital.setStatus(details.getStatus());
        }
        if (details.getEmergencyServices() != null) {
            hospital.setEmergencyServices(details.getEmergencyServices());
        }
        if (details.getLatitude() != null) {
            hospital.setLatitude(details.getLatitude());
        }
        if (details.getLongitude() != null) {
            hospital.setLongitude(details.getLongitude());
        }
        if (details.getServices() != null) {
            hospital.setServices(details.getServices());
        }
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public void deleteHospital(Long id) {
        Hospital hospital = getHospitalById(id);
        hospitalRepository.delete(hospital);
    }

    @Transactional(readOnly = true)
    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Hospital> getAllHospitals(Pageable pageable) {
        return hospitalRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hospital not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Hospital> getHospitalsByState(String state) {
        return hospitalRepository.findByStateIgnoreCase(state);
    }

    @Transactional(readOnly = true)
    public Page<Hospital> getHospitalsByState(String state, Pageable pageable) {
        return hospitalRepository.findByStateIgnoreCase(state, pageable);
    }

    @Transactional(readOnly = true)
    public List<Hospital> getHospitalsByDistrict(String district) {
        return hospitalRepository.findByDistrictIgnoreCase(district);
    }

    @Transactional(readOnly = true)
    public Page<Hospital> getHospitalsByDistrict(String district, Pageable pageable) {
        return hospitalRepository.findByDistrictIgnoreCase(district, pageable);
    }

    @Transactional(readOnly = true)
    public List<Hospital> searchHospitals(String query) {
        if (query == null || query.isBlank()) {
            return hospitalRepository.findAll();
        }
        return hospitalRepository.searchHospitals(query);
    }

    @Transactional(readOnly = true)
    public Page<Hospital> searchHospitals(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return hospitalRepository.findAll(pageable);
        }
        return hospitalRepository.searchHospitals(query, pageable);
    }
}

