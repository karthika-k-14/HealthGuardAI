package com.healthguard.service;

import com.healthguard.dto.VillageResponse;
import com.healthguard.mapper.VillageMapper;
import com.healthguard.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read-only listing of villages for {@code GET /admin/villages}, used to
 * populate the "Send to Village" target picker on the Broadcast
 * Notification page. Not a full Village CRUD module - that is out of
 * scope here.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VillageService {

    private final VillageRepository villageRepository;
    private final VillageMapper villageMapper;

    public List<VillageResponse> getAllVillages() {
        return villageRepository.findAllByOrderByVillageNameAsc().stream()
                .map(villageMapper::toResponse)
                .toList();
    }
}
