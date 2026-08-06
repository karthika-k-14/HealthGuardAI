package com.healthguard.service;

import com.healthguard.dto.HospitalRequest;
import com.healthguard.dto.HospitalResponse;
import com.healthguard.entity.Hospital;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.HospitalMapper;
import com.healthguard.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for the Hospital CRUD module ({@code /admin/hospitals/**}).
 * A hospital is a standalone referral facility record managed directly by
 * Admins - it does not belong to a village like {@link com.healthguard.entity.Phc} does.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalService {

    private static final String DEFAULT_STATUS = "Operational";

    private final HospitalRepository hospitalRepository;
    private final HospitalMapper hospitalMapper;

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(hospitalMapper::toResponse)
                .toList();
    }

    public HospitalResponse getHospitalById(Long hospitalId) {
        return hospitalMapper.toResponse(findHospitalOrThrow(hospitalId));
    }

    @Transactional
    public HospitalResponse createHospital(HospitalRequest request) {
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .type(request.getType())
                .address(request.getAddress())
                .district(request.getDistrict())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .beds(request.getBeds())
                .emergencyServices(request.getEmergencyServices() != null && request.getEmergencyServices())
                .status(request.getStatus() != null && !request.getStatus().isBlank()
                        ? request.getStatus() : DEFAULT_STATUS)
                .build();

        return hospitalMapper.toResponse(hospitalRepository.save(hospital));
    }

    @Transactional
    public HospitalResponse updateHospital(Long hospitalId, HospitalRequest request) {
        Hospital hospital = findHospitalOrThrow(hospitalId);

        hospital.setName(request.getName());
        hospital.setType(request.getType());
        hospital.setAddress(request.getAddress());
        hospital.setDistrict(request.getDistrict());
        hospital.setPhone(request.getPhone());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setBeds(request.getBeds());
        hospital.setEmergencyServices(request.getEmergencyServices() != null && request.getEmergencyServices());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            hospital.setStatus(request.getStatus());
        }

        return hospitalMapper.toResponse(hospitalRepository.save(hospital));
    }

    @Transactional
    public void deleteHospital(Long hospitalId) {
        Hospital hospital = findHospitalOrThrow(hospitalId);
        hospitalRepository.delete(hospital);
    }

    private Hospital findHospitalOrThrow(Long hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + hospitalId));
    }
}
