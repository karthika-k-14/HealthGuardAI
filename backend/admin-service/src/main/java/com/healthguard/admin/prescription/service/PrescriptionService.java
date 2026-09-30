package com.healthguard.admin.prescription.service;

import com.healthguard.admin.prescription.dto.PrescriptionRequest;
import com.healthguard.admin.prescription.dto.PrescriptionResponse;
import com.healthguard.admin.prescription.dto.UpdatePrescriptionRequest;

import java.util.List;

public interface PrescriptionService {

    PrescriptionResponse createPrescription(PrescriptionRequest request);

    PrescriptionResponse getPrescriptionById(Long id);

    PrescriptionResponse updatePrescription(Long id, UpdatePrescriptionRequest request);

    void deletePrescription(Long id);

    List<PrescriptionResponse> getAllPrescriptions();
}
