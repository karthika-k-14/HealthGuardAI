package com.healthguard.admin.prescription.service.impl;

import com.healthguard.admin.exception.ResourceNotFoundException;
import com.healthguard.admin.prescription.dto.PrescriptionRequest;
import com.healthguard.admin.prescription.dto.PrescriptionResponse;
import com.healthguard.admin.prescription.dto.UpdatePrescriptionRequest;
import com.healthguard.admin.prescription.entity.Prescription;
import com.healthguard.admin.prescription.repository.PrescriptionRepository;
import com.healthguard.admin.prescription.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    @Override
    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request) {
        Prescription prescription = Prescription.builder()
                .citizenId(request.getCitizenId())
                .doctorName(request.getDoctorName())
                .medicineName(request.getMedicineName())
                .dosage(request.getDosage())
                .duration(request.getDuration())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Prescription saved = prescriptionRepository.save(prescription);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        return mapToResponse(prescription);
    }

    @Override
    @Transactional
    public PrescriptionResponse updatePrescription(Long id, UpdatePrescriptionRequest request) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));

        if (request.getDoctorName() != null) prescription.setDoctorName(request.getDoctorName());
        if (request.getMedicineName() != null) prescription.setMedicineName(request.getMedicineName());
        if (request.getDosage() != null) prescription.setDosage(request.getDosage());
        if (request.getDuration() != null) prescription.setDuration(request.getDuration());
        if (request.getStatus() != null) prescription.setStatus(request.getStatus());

        Prescription updated = prescriptionRepository.save(prescription);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        prescriptionRepository.delete(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PrescriptionResponse mapToResponse(Prescription prescription) {
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .citizenId(prescription.getCitizenId())
                .doctorName(prescription.getDoctorName())
                .medicineName(prescription.getMedicineName())
                .dosage(prescription.getDosage())
                .duration(prescription.getDuration())
                .status(prescription.getStatus())
                .createdAt(prescription.getCreatedAt())
                .build();
    }
}
