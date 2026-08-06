package com.healthguard.service;

import com.healthguard.dto.PrescriptionItemRequest;
import com.healthguard.dto.PrescriptionRequest;
import com.healthguard.dto.PrescriptionResponse;
import com.healthguard.dto.PrescriptionStatusUpdateRequest;
import com.healthguard.dto.PrescriptionUpdateRequest;
import com.healthguard.entity.Citizen;
import com.healthguard.entity.Medicine;
import com.healthguard.entity.Pharmacist;
import com.healthguard.entity.Prescription;
import com.healthguard.entity.PrescriptionItem;
import com.healthguard.entity.PrescriptionStatus;
import com.healthguard.exception.BadRequestException;
import com.healthguard.exception.ResourceNotFoundException;
import com.healthguard.mapper.PrescriptionMapper;
import com.healthguard.repository.CitizenRepository;
import com.healthguard.repository.MedicineRepository;
import com.healthguard.repository.PrescriptionRepository;
import com.healthguard.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing prescriptions, assigning to citizens, dispensing, and status workflows
 * (Phase 11A - Prescription Module).
 */
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final CitizenRepository citizenRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionMapper prescriptionMapper;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request, UserPrincipal principal) {
        Citizen citizen = null;
        if (request.getCitizenId() != null) {
            citizen = citizenRepository.findById(request.getCitizenId())
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + request.getCitizenId()));
        }

        String patientName = request.getPatientName();
        if ((patientName == null || patientName.isBlank()) && citizen != null) {
            patientName = (citizen.getFirstName() + " " + citizen.getLastName()).trim();
        }

        Prescription prescription = Prescription.builder()
                .patientName(patientName)
                .patientAge(request.getPatientAge())
                .referredBy(request.getReferredBy())
                .notes(request.getNotes())
                .status(PrescriptionStatus.PENDING)
                .citizen(citizen)
                .items(new ArrayList<>())
                .build();

        if (principal != null && principal.getUser() instanceof Pharmacist pharmacist) {
            prescription.setHandledBy(pharmacist);
        }

        List<String> medicineNames = new ArrayList<>();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PrescriptionItemRequest itemReq : request.getItems()) {
                Medicine medicine = null;
                if (itemReq.getMedicineId() != null) {
                    medicine = medicineRepository.findById(itemReq.getMedicineId()).orElse(null);
                }
                PrescriptionItem item = prescriptionMapper.toPrescriptionItem(itemReq, medicine, prescription);
                prescription.getItems().add(item);
                if (item.getMedicineName() != null && !item.getMedicineName().isBlank()) {
                    medicineNames.add(item.getMedicineName());
                }
            }
        } else if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            for (String medName : request.getMedicines()) {
                if (medName != null && !medName.isBlank()) {
                    String trimmed = medName.trim();
                    medicineNames.add(trimmed);
                    Medicine medicine = medicineRepository.findByNameContainingIgnoreCase(trimmed)
                            .stream().findFirst().orElse(null);
                    PrescriptionItem item = PrescriptionItem.builder()
                            .prescription(prescription)
                            .medicine(medicine)
                            .medicineName(trimmed)
                            .build();
                    prescription.getItems().add(item);
                }
            }
        }

        prescription.setMedicines(prescriptionMapper.joinMedicines(medicineNames));

        Prescription saved = prescriptionRepository.save(prescription);
        return prescriptionMapper.toPrescriptionResponse(saved);
    }

    @Transactional
    public PrescriptionResponse updatePrescription(Long id, PrescriptionUpdateRequest request) {
        Prescription prescription = findPrescriptionEntity(id);

        if (request.getPatientName() != null && !request.getPatientName().isBlank()) {
            prescription.setPatientName(request.getPatientName());
        }
        if (request.getPatientAge() != null) {
            prescription.setPatientAge(request.getPatientAge());
        }
        if (request.getReferredBy() != null) {
            prescription.setReferredBy(request.getReferredBy());
        }
        if (request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }
        if (request.getStatus() != null) {
            updateStatusFields(prescription, request.getStatus());
        }
        if (request.getCitizenId() != null) {
            Citizen citizen = citizenRepository.findById(request.getCitizenId())
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + request.getCitizenId()));
            prescription.setCitizen(citizen);
        }

        if (request.getItems() != null) {
            prescription.getItems().clear();
            List<String> medNames = new ArrayList<>();
            for (PrescriptionItemRequest itemReq : request.getItems()) {
                Medicine medicine = null;
                if (itemReq.getMedicineId() != null) {
                    medicine = medicineRepository.findById(itemReq.getMedicineId()).orElse(null);
                }
                PrescriptionItem item = prescriptionMapper.toPrescriptionItem(itemReq, medicine, prescription);
                prescription.getItems().add(item);
                if (item.getMedicineName() != null && !item.getMedicineName().isBlank()) {
                    medNames.add(item.getMedicineName());
                }
            }
            prescription.setMedicines(prescriptionMapper.joinMedicines(medNames));
        } else if (request.getMedicines() != null) {
            prescription.setMedicines(prescriptionMapper.joinMedicines(request.getMedicines()));
        }

        Prescription updated = prescriptionRepository.save(prescription);
        return prescriptionMapper.toPrescriptionResponse(updated);
    }

    @Transactional
    public void deletePrescription(Long id) {
        Prescription prescription = findPrescriptionEntity(id);
        prescriptionRepository.delete(prescription);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        return prescriptionMapper.toPrescriptionResponse(findPrescriptionEntity(id));
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> listPrescriptions(PrescriptionStatus status, Long citizenId, String search) {
        List<Prescription> prescriptions;
        if (status != null || citizenId != null || (search != null && !search.isBlank())) {
            prescriptions = prescriptionRepository.searchPrescriptions(status, citizenId, search);
        } else {
            prescriptions = prescriptionRepository.findByOrderByCreatedAtDesc();
        }
        return prescriptions.stream().map(prescriptionMapper::toPrescriptionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionHistory(PrescriptionStatus status, Long citizenId, String search) {
        return listPrescriptions(status, citizenId, search);
    }

    @Transactional
    public PrescriptionResponse assignPrescriptionToCitizen(Long id, Long citizenId) {
        Prescription prescription = findPrescriptionEntity(id);
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found with id: " + citizenId));

        prescription.setCitizen(citizen);
        if (prescription.getPatientName() == null || prescription.getPatientName().isBlank()) {
            prescription.setPatientName((citizen.getFirstName() + " " + citizen.getLastName()).trim());
        }

        Prescription saved = prescriptionRepository.save(prescription);
        return prescriptionMapper.toPrescriptionResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getCitizenPrescriptions(Long citizenId) {
        if (!citizenRepository.existsById(citizenId)) {
            throw new ResourceNotFoundException("Citizen not found with id: " + citizenId);
        }
        List<Prescription> prescriptions = prescriptionRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId);
        return prescriptions.stream().map(prescriptionMapper::toPrescriptionResponse).toList();
    }

    @Transactional
    public PrescriptionResponse dispensePrescription(Long id, PrescriptionStatusUpdateRequest request, UserPrincipal principal) {
        Prescription prescription = findPrescriptionEntity(id);

        if (prescription.getStatus() == PrescriptionStatus.REJECTED) {
            throw new BadRequestException("A rejected prescription cannot be dispensed");
        }

        prescription.setStatus(PrescriptionStatus.DISPENSED);
        prescription.setDispensedAt(LocalDateTime.now());

        if (request != null && request.getNotes() != null) {
            prescription.setNotes(request.getNotes());
        }

        if (principal != null && principal.getUser() instanceof Pharmacist pharmacist) {
            prescription.setHandledBy(pharmacist);
        }

        // Deduct inventory stock for prescribed items if matching medicine is found
        if (prescription.getItems() != null && !prescription.getItems().isEmpty()) {
            for (PrescriptionItem item : prescription.getItems()) {
                Medicine medicine = item.getMedicine();
                if (medicine == null && item.getMedicineName() != null) {
                    medicine = medicineRepository.findByNameContainingIgnoreCase(item.getMedicineName().trim())
                            .stream().findFirst().orElse(null);
                }
                if (medicine != null) {
                    int qtyToDeduct = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
                    int newQty = Math.max(0, medicine.getQuantity() - qtyToDeduct);
                    medicine.setQuantity(newQty);
                    medicineRepository.save(medicine);
                }
            }
        } else if (prescription.getMedicines() != null && !prescription.getMedicines().isBlank()) {
            for (String rawName : prescription.getMedicines().split(",")) {
                String trimmed = rawName.trim();
                if (!trimmed.isEmpty()) {
                    Medicine medicine = medicineRepository.findByNameContainingIgnoreCase(trimmed)
                            .stream().findFirst().orElse(null);
                    if (medicine != null) {
                        int newQty = Math.max(0, medicine.getQuantity() - 1);
                        medicine.setQuantity(newQty);
                        medicineRepository.save(medicine);
                    }
                }
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);
        return prescriptionMapper.toPrescriptionResponse(saved);
    }

    @Transactional
    public PrescriptionResponse updatePrescriptionStatus(Long id, PrescriptionStatus status, String notes, UserPrincipal principal) {
        Prescription prescription = findPrescriptionEntity(id);

        if (status != null) {
            updateStatusFields(prescription, status);
        }

        if (notes != null) {
            prescription.setNotes(notes);
        }

        if (principal != null && principal.getUser() instanceof Pharmacist pharmacist) {
            prescription.setHandledBy(pharmacist);
        }

        Prescription saved = prescriptionRepository.save(prescription);
        return prescriptionMapper.toPrescriptionResponse(saved);
    }

    private void updateStatusFields(Prescription prescription, PrescriptionStatus newStatus) {
        prescription.setStatus(newStatus);
        if (newStatus == PrescriptionStatus.VERIFIED && prescription.getVerifiedAt() == null) {
            prescription.setVerifiedAt(LocalDateTime.now());
        } else if (newStatus == PrescriptionStatus.DISPENSED) {
            if (prescription.getVerifiedAt() == null) {
                prescription.setVerifiedAt(LocalDateTime.now());
            }
            if (prescription.getDispensedAt() == null) {
                prescription.setDispensedAt(LocalDateTime.now());
            }
        }
    }

    private Prescription findPrescriptionEntity(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
    }
}
