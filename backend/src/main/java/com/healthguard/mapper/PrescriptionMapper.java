package com.healthguard.mapper;

import com.healthguard.dto.PrescriptionItemRequest;
import com.healthguard.dto.PrescriptionItemResponse;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.Medicine;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.PrescriptionItem;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Maps between Prescription domain entities and DTOs (Phase 11A - Prescription Module).
 */
@Component
public class PrescriptionMapper {

    public PrescriptionResponse toPrescriptionResponse(Prescription prescription) {
        if (prescription == null) {
            return null;
        }

        Pharmacist pharmacist = prescription.getHandledBy();
        Citizen citizen = prescription.getCitizen();

        List<PrescriptionItemResponse> itemResponses = prescription.getItems() != null
                ? prescription.getItems().stream().map(this::toPrescriptionItemResponse).toList()
                : List.of();

        List<String> medicinesList;
        if (itemResponses != null && !itemResponses.isEmpty()) {
            medicinesList = itemResponses.stream().map(PrescriptionItemResponse::getMedicineName).toList();
        } else {
            medicinesList = splitMedicines(prescription.getMedicines());
        }

        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .uuid(prescription.getUuid())
                .patientName(prescription.getPatientName())
                .patientAge(prescription.getPatientAge())
                .referredBy(prescription.getReferredBy())
                .medicines(medicinesList)
                .items(itemResponses)
                .status(prescription.getStatus())
                .notes(prescription.getNotes())
                .citizenId(citizen != null ? citizen.getId() : null)
                .citizenName(citizen != null ? (citizen.getFirstName() + " " + citizen.getLastName()).trim() : null)
                .handledByName(pharmacist != null ? (pharmacist.getFirstName() + " " + pharmacist.getLastName()).trim() : null)
                .verifiedAt(prescription.getVerifiedAt())
                .dispensedAt(prescription.getDispensedAt())
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }

    public PrescriptionItemResponse toPrescriptionItemResponse(PrescriptionItem item) {
        if (item == null) {
            return null;
        }

        Medicine med = item.getMedicine();
        return PrescriptionItemResponse.builder()
                .id(item.getId())
                .uuid(item.getUuid())
                .medicineId(med != null ? med.getId() : null)
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .duration(item.getDuration())
                .quantity(item.getQuantity())
                .instructions(item.getInstructions())
                .build();
    }

    public PrescriptionItem toPrescriptionItem(PrescriptionItemRequest request, Medicine medicine, Prescription prescription) {
        if (request == null) {
            return null;
        }

        return PrescriptionItem.builder()
                .prescription(prescription)
                .medicine(medicine)
                .medicineName(request.getMedicineName() != null ? request.getMedicineName() : (medicine != null ? medicine.getName() : ""))
                .dosage(request.getDosage())
                .frequency(request.getFrequency())
                .duration(request.getDuration())
                .quantity(request.getQuantity())
                .instructions(request.getInstructions())
                .build();
    }

    public String joinMedicines(List<String> medicines) {
        if (medicines == null || medicines.isEmpty()) {
            return "";
        }
        return String.join(",", medicines);
    }

    public List<String> splitMedicines(String medicines) {
        if (medicines == null || medicines.isBlank()) {
            return List.of();
        }
        return Arrays.stream(medicines.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
