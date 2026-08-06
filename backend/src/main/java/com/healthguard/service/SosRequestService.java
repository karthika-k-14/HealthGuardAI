package com.healthguard.service;

import com.healthguard.dto.SosRequestCreateRequest;
import com.healthguard.dto.SosRequestResponse;
import com.healthguard.dto.SosStatusUpdateRequest;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.Role;
import com.healthguard.entity.SosRequest;
import com.healthguard.entity.SosStatus;
import com.healthguard.entity.User;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.SosRequestMapper;
import com.healthguard.repository.SosRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Business logic for the SOS Request feature: a citizen raises an SOS,
 * responding staff (ASHA worker / Health Officer / Admin) view and act on
 * it, moving it through {@link SosStatus} until resolved.
 */
@Service
@RequiredArgsConstructor
public class SosRequestService {

    private static final Set<Role> RESPONDER_ROLES = Set.of(Role.ASHA_WORKER, Role.HEALTH_OFFICER, Role.ADMIN);

    private final SosRequestRepository sosRequestRepository;
    private final SosRequestMapper sosRequestMapper;

    @Transactional
    public SosRequestResponse createSos(Citizen citizen, SosRequestCreateRequest request) {
        SosRequest sos = sosRequestMapper.toEntity(request, citizen);
        SosRequest saved = sosRequestRepository.save(sos);
        return sosRequestMapper.toResponse(saved);
    }

    /**
     * View a single SOS request. The owning citizen may always view their
     * own request; responding staff (ASHA/Officer/Admin) may view any.
     */
    public SosRequestResponse getSos(Long sosId, User requester) {
        SosRequest sos = sosRequestRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS request not found: " + sosId));
        requireCanView(sos, requester);
        return sosRequestMapper.toResponse(sos);
    }

    /** The authenticated citizen's own SOS history, most recent first. */
    @Transactional(readOnly = true)
    public List<SosRequestResponse> getHistory(Citizen citizen) {
        return sosRequestRepository.findByCitizenIdOrderByCreatedAtDesc(citizen.getId())
                .stream()
                .map(sosRequestMapper::toResponse)
                .toList();
    }

    /** All SOS requests, most recent first — for responding staff dashboards. */
    public List<SosRequestResponse> listAll(User requester) {
        requireResponder(requester);
        return sosRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(sosRequestMapper::toResponse)
                .toList();
    }

    /** Active (not yet Resolved/Cancelled) SOS requests — for responding staff dashboards. */
    public List<SosRequestResponse> listActive(User requester) {
        requireResponder(requester);
        List<SosRequest> notResolved = sosRequestRepository.findByStatusNotOrderByCreatedAtDesc(SosStatus.RESOLVED);
        return notResolved.stream()
                .filter(sos -> sos.getStatus() != SosStatus.CANCELLED)
                .map(sosRequestMapper::toResponse)
                .toList();
    }

    @Transactional
    public SosRequestResponse updateStatus(Long sosId, User requester, SosStatusUpdateRequest request) {
        requireResponder(requester);
        SosRequest sos = sosRequestRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS request not found: " + sosId));

        sos.setStatus(request.getStatus());
        sos.setStatusNote(request.getNote());
        sos.setRespondedByName(String.format("%s %s", nullToEmpty(requester.getFirstName()), nullToEmpty(requester.getLastName())).trim());
        sos.setRespondedByRole(requester.getRole());
        if (request.getStatus() == SosStatus.RESOLVED || request.getStatus() == SosStatus.CANCELLED) {
            sos.setResolvedAt(LocalDateTime.now());
        } else {
            sos.setResolvedAt(null);
        }

        SosRequest saved = sosRequestRepository.save(sos);
        return sosRequestMapper.toResponse(saved);
    }

    private void requireCanView(SosRequest sos, User requester) {
        boolean isOwner = sos.getCitizen() != null && sos.getCitizen().getId().equals(requester.getId());
        boolean isResponder = requester.getRole() != null && RESPONDER_ROLES.contains(requester.getRole());
        if (!isOwner && !isResponder) {
            throw new BadRequestException("You are not authorized to view this SOS request");
        }
    }

    private void requireResponder(User requester) {
        if (requester.getRole() == null || !RESPONDER_ROLES.contains(requester.getRole())) {
            throw new BadRequestException("Only responding staff can perform this action");
        }
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
