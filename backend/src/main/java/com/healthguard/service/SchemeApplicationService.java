package com.healthguard.service;

import com.healthguard.dto.SchemeApplicationRequest;
import com.healthguard.dto.SchemeApplicationResponse;
import com.healthguard.dto.SchemeApplicationReviewRequest;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.Scheme;
import com.healthguard.entity.SchemeApplication;
import com.healthguard.entity.SchemeApplicationStatus;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.SchemeApplicationMapper;
import com.healthguard.repository.SchemeApplicationRepository;
import com.healthguard.repository.SchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Business logic for Scheme Beneficiary Management: a citizen applying for
 * a {@link Scheme}, and admin review moving that application through
 * {@link SchemeApplicationStatus#PENDING} -&gt;
 * {@link SchemeApplicationStatus#ELIGIBLE} -&gt;
 * {@link SchemeApplicationStatus#APPROVED} (or
 * {@link SchemeApplicationStatus#REJECTED} at any point before approval).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchemeApplicationService {

    private static final List<SchemeApplicationStatus> ACTIVE_STATUSES =
            List.of(SchemeApplicationStatus.PENDING, SchemeApplicationStatus.ELIGIBLE, SchemeApplicationStatus.APPROVED);

    private final SchemeApplicationRepository schemeApplicationRepository;
    private final SchemeRepository schemeRepository;
    private final SchemeApplicationMapper schemeApplicationMapper;

    // ---- Citizen: Apply for Scheme --------------------------------------

    @Transactional
    public SchemeApplicationResponse apply(Citizen citizen, SchemeApplicationRequest request) {
        Scheme scheme = schemeRepository.findById(request.getSchemeId())
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found with id: " + request.getSchemeId()));

        schemeApplicationRepository
                .findByCitizenIdAndSchemeIdAndStatusIn(citizen.getId(), scheme.getId(), ACTIVE_STATUSES)
                .ifPresent(existing -> {
                    throw new BadRequestException("You already have an active application for this scheme");
                });

        SchemeApplication application = SchemeApplication.builder()
                .citizen(citizen)
                .scheme(scheme)
                .status(SchemeApplicationStatus.PENDING)
                .build();

        return schemeApplicationMapper.toResponse(schemeApplicationRepository.save(application));
    }

    public List<SchemeApplicationResponse> getMyApplications(Citizen citizen) {
        return schemeApplicationRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId()).stream()
                .map(schemeApplicationMapper::toResponse)
                .toList();
    }

    // ---- Admin: review queues --------------------------------------------

    public List<SchemeApplicationResponse> getAllApplications() {
        return schemeApplicationRepository.findAll().stream()
                .map(schemeApplicationMapper::toResponse)
                .toList();
    }

    /** Citizens whose application has been marked eligible, pending final approval. */
    public List<SchemeApplicationResponse> getEligibleCitizens() {
        return findByStatus(SchemeApplicationStatus.ELIGIBLE);
    }

    /** Citizens whose application has been approved - the scheme's beneficiaries. */
    public List<SchemeApplicationResponse> getApprovedBeneficiaries() {
        return findByStatus(SchemeApplicationStatus.APPROVED);
    }

    /** Citizens whose application was rejected. */
    public List<SchemeApplicationResponse> getRejectedBeneficiaries() {
        return findByStatus(SchemeApplicationStatus.REJECTED);
    }

    private List<SchemeApplicationResponse> findByStatus(SchemeApplicationStatus status) {
        return schemeApplicationRepository.findByStatus(status).stream()
                .map(schemeApplicationMapper::toResponse)
                .toList();
    }

    // ---- Admin: review actions --------------------------------------------

    @Transactional
    public SchemeApplicationResponse markEligible(Long applicationId, SchemeApplicationReviewRequest request) {
        SchemeApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != SchemeApplicationStatus.PENDING) {
            throw new BadRequestException("Only a pending application can be marked eligible");
        }

        application.setStatus(SchemeApplicationStatus.ELIGIBLE);
        applyRemarksAndReviewedAt(application, request);

        return schemeApplicationMapper.toResponse(schemeApplicationRepository.save(application));
    }

    @Transactional
    public SchemeApplicationResponse approve(Long applicationId, SchemeApplicationReviewRequest request) {
        SchemeApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() != SchemeApplicationStatus.PENDING
                && application.getStatus() != SchemeApplicationStatus.ELIGIBLE) {
            throw new BadRequestException("Only a pending or eligible application can be approved");
        }

        application.setStatus(SchemeApplicationStatus.APPROVED);
        applyRemarksAndReviewedAt(application, request);

        return schemeApplicationMapper.toResponse(schemeApplicationRepository.save(application));
    }

    @Transactional
    public SchemeApplicationResponse reject(Long applicationId, SchemeApplicationReviewRequest request) {
        SchemeApplication application = findApplicationOrThrow(applicationId);

        if (application.getStatus() == SchemeApplicationStatus.APPROVED
                || application.getStatus() == SchemeApplicationStatus.REJECTED) {
            throw new BadRequestException("An approved or already-rejected application cannot be rejected");
        }

        application.setStatus(SchemeApplicationStatus.REJECTED);
        applyRemarksAndReviewedAt(application, request);

        return schemeApplicationMapper.toResponse(schemeApplicationRepository.save(application));
    }

    private void applyRemarksAndReviewedAt(SchemeApplication application, SchemeApplicationReviewRequest request) {
        if (request != null && request.getRemarks() != null && !request.getRemarks().isBlank()) {
            application.setRemarks(request.getRemarks());
        }
        application.setReviewedAt(LocalDateTime.now());
    }

    private SchemeApplication findApplicationOrThrow(Long applicationId) {
        return schemeApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme application not found with id: " + applicationId));
    }
}
