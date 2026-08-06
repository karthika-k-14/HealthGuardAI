package com.healthguard.service;

import com.healthguard.dto.PhcRequest;
import com.healthguard.dto.PhcResponse;
import com.healthguard.entity.Phc;
import com.healthguard.entity.Village;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.PhcMapper;
import com.healthguard.repository.PhcRepository;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for the Admin PHC CRUD module ({@code /admin/phcs/**}).
 * A PHC may optionally be linked to a {@link Village} via {@code villageId}.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhcService {

    private final PhcRepository phcRepository;
    private final VillageRepository villageRepository;
    private final PhcMapper phcMapper;

    public List<PhcResponse> getAllPhcs() {
        return phcRepository.findAll().stream()
                .map(phcMapper::toResponse)
                .toList();
    }

    public PhcResponse getPhcById(Long phcId) {
        return phcMapper.toResponse(findPhcOrThrow(phcId));
    }

    @Transactional
    public PhcResponse createPhc(PhcRequest request) {
        Phc phc = Phc.builder()
                .name(request.getName())
                .address(request.getAddress())
                .district(request.getDistrict())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .village(resolveVillage(request.getVillageId()))
                .build();

        return phcMapper.toResponse(phcRepository.save(phc));
    }

    @Transactional
    public PhcResponse updatePhc(Long phcId, PhcRequest request) {
        Phc phc = findPhcOrThrow(phcId);

        phc.setName(request.getName());
        phc.setAddress(request.getAddress());
        phc.setDistrict(request.getDistrict());
        phc.setPhone(request.getPhone());
        phc.setLatitude(request.getLatitude());
        phc.setLongitude(request.getLongitude());
        phc.setVillage(resolveVillage(request.getVillageId()));

        return phcMapper.toResponse(phcRepository.save(phc));
    }

    @Transactional
    public void deletePhc(Long phcId) {
        Phc phc = findPhcOrThrow(phcId);
        phcRepository.delete(phc);
    }

    private Phc findPhcOrThrow(Long phcId) {
        return phcRepository.findById(phcId)
                .orElseThrow(() -> new ResourceNotFoundException("PHC not found with id: " + phcId));
    }

    private Village resolveVillage(Long villageId) {
        if (villageId == null) {
            return null;
        }
        return villageRepository.findById(villageId)
                .orElseThrow(() -> new ResourceNotFoundException("Village not found with id: " + villageId));
    }
}
