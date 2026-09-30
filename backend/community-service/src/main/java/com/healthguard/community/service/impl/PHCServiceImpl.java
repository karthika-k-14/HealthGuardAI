package com.healthguard.community.service.impl;

import com.healthguard.community.dto.PHCRequest;
import com.healthguard.community.dto.PHCResponse;
import com.healthguard.community.dto.UpdatePHCRequest;
import com.healthguard.community.entity.PHC;
import com.healthguard.community.exception.DuplicateResourceException;
import com.healthguard.community.exception.ResourceNotFoundException;
import com.healthguard.community.repository.PHCRepository;
import com.healthguard.community.service.PHCService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PHCServiceImpl implements PHCService {

    private final PHCRepository phcRepository;

    @Override
    @Transactional
    public PHCResponse createPHC(PHCRequest request) {
        if (phcRepository.existsByPhcCode(request.getPhcCode())) {
            throw new DuplicateResourceException("PHC already exists with Code: " + request.getPhcCode());
        }

        PHC phc = PHC.builder()
                .phcCode(request.getPhcCode())
                .name(request.getName())
                .district(request.getDistrict())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .contactNumber(request.getContactNumber())
                .medicalOfficer(request.getMedicalOfficer())
                .totalBeds(request.getTotalBeds())
                .availableBeds(request.getAvailableBeds())
                .icuBeds(request.getIcuBeds())
                .availableIcuBeds(request.getAvailableIcuBeds())
                .ambulances(request.getAmbulances())
                .build();

        PHC savedPhc = phcRepository.save(phc);
        return mapToResponse(savedPhc);
    }

    @Override
    @Transactional(readOnly = true)
    public PHCResponse getPHCById(Long id) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));
        return mapToResponse(phc);
    }

    @Override
    @Transactional(readOnly = true)
    public PHCResponse getPHCByCode(String phcCode) {
        PHC phc = phcRepository.findByPhcCode(phcCode)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with Code: " + phcCode));
        return mapToResponse(phc);
    }

    @Override
    @Transactional
    public PHCResponse updatePHC(Long id, UpdatePHCRequest request) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));

        if (request.getName() != null) phc.setName(request.getName());
        if (request.getDistrict() != null) phc.setDistrict(request.getDistrict());
        if (request.getAddress() != null) phc.setAddress(request.getAddress());
        if (request.getLatitude() != null) phc.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) phc.setLongitude(request.getLongitude());
        if (request.getContactNumber() != null) phc.setContactNumber(request.getContactNumber());
        if (request.getMedicalOfficer() != null) phc.setMedicalOfficer(request.getMedicalOfficer());
        if (request.getTotalBeds() != null) phc.setTotalBeds(request.getTotalBeds());
        if (request.getAvailableBeds() != null) phc.setAvailableBeds(request.getAvailableBeds());
        if (request.getIcuBeds() != null) phc.setIcuBeds(request.getIcuBeds());
        if (request.getAvailableIcuBeds() != null) phc.setAvailableIcuBeds(request.getAvailableIcuBeds());
        if (request.getAmbulances() != null) phc.setAmbulances(request.getAmbulances());

        PHC updatedPhc = phcRepository.save(phc);
        return mapToResponse(updatedPhc);
    }

    @Override
    @Transactional
    public void deletePHC(Long id) {
        PHC phc = phcRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with ID: " + id));
        phcRepository.delete(phc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PHCResponse> getAllPHCs(String district) {
        List<PHC> phcList;
        if (district != null && !district.isBlank()) {
            phcList = phcRepository.findByDistrict(district);
        } else {
            phcList = phcRepository.findAll();
        }
        return phcList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private PHCResponse mapToResponse(PHC phc) {
        return PHCResponse.builder()
                .id(phc.getId())
                .phcCode(phc.getPhcCode())
                .name(phc.getName())
                .district(phc.getDistrict())
                .address(phc.getAddress())
                .latitude(phc.getLatitude())
                .longitude(phc.getLongitude())
                .contactNumber(phc.getContactNumber())
                .medicalOfficer(phc.getMedicalOfficer())
                .totalBeds(phc.getTotalBeds())
                .availableBeds(phc.getAvailableBeds())
                .icuBeds(phc.getIcuBeds())
                .availableIcuBeds(phc.getAvailableIcuBeds())
                .ambulances(phc.getAmbulances())
                .createdAt(phc.getCreatedAt())
                .updatedAt(phc.getUpdatedAt())
                .build();
    }
}
