package com.healthguard.service;

import com.healthguard.dto.SchemeRequest;
import com.healthguard.dto.SchemeResponse;
import com.healthguard.entity.Scheme;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.SchemeMapper;
import com.healthguard.repository.SchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Business logic for the Government Scheme CRUD module
 * ({@code /schemes/**} for reads, {@code /admin/schemes/**} for writes).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchemeService {

    private final SchemeRepository schemeRepository;
    private final SchemeMapper schemeMapper;

    public List<SchemeResponse> getAllSchemes() {
        return schemeRepository.findAll().stream()
                .map(schemeMapper::toResponse)
                .toList();
    }

    public SchemeResponse getSchemeById(Long schemeId) {
        return schemeMapper.toResponse(findSchemeOrThrow(schemeId));
    }

    /**
     * Free-text search across name/description, optionally narrowed to a
     * single category. Either parameter may be blank/null.
     */
    public List<SchemeResponse> searchSchemes(String query, String category) {
        List<Scheme> results;

        boolean hasQuery = StringUtils.hasText(query);
        boolean hasCategory = StringUtils.hasText(category);

        if (hasQuery && hasCategory) {
            results = schemeRepository
                    .findByCategoryAndNameContainingIgnoreCaseOrCategoryAndDescriptionContainingIgnoreCase(
                            category, query, category, query);
        } else if (hasQuery) {
            results = schemeRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        } else if (hasCategory) {
            results = schemeRepository.findByCategory(category);
        } else {
            results = schemeRepository.findAll();
        }

        return results.stream().map(schemeMapper::toResponse).toList();
    }

    @Transactional
    public SchemeResponse createScheme(SchemeRequest request) {
        Scheme scheme = Scheme.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .eligibility(request.getEligibility())
                .applyUrl(request.getApplyUrl())
                .benefits(request.getBenefits() != null ? new ArrayList<>(request.getBenefits()) : new ArrayList<>())
                .build();

        return schemeMapper.toResponse(schemeRepository.save(scheme));
    }

    @Transactional
    public SchemeResponse updateScheme(Long schemeId, SchemeRequest request) {
        Scheme scheme = findSchemeOrThrow(schemeId);

        scheme.setName(request.getName());
        scheme.setDescription(request.getDescription());
        scheme.setCategory(request.getCategory());
        scheme.setEligibility(request.getEligibility());
        scheme.setApplyUrl(request.getApplyUrl());
        scheme.setBenefits(request.getBenefits() != null ? new ArrayList<>(request.getBenefits()) : new ArrayList<>());

        return schemeMapper.toResponse(schemeRepository.save(scheme));
    }

    @Transactional
    public void deleteScheme(Long schemeId) {
        Scheme scheme = findSchemeOrThrow(schemeId);
        schemeRepository.delete(scheme);
    }

    private Scheme findSchemeOrThrow(Long schemeId) {
        return schemeRepository.findById(schemeId)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found with id: " + schemeId));
    }
}
