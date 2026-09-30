package com.healthguard.admin.medicine.service;

import com.healthguard.admin.medicine.dto.MedicineRequest;
import com.healthguard.admin.medicine.dto.MedicineResponse;
import com.healthguard.admin.medicine.dto.UpdateMedicineRequest;

import java.util.List;

public interface MedicineService {

    MedicineResponse createMedicine(MedicineRequest request);

    MedicineResponse getMedicineById(Long id);

    MedicineResponse updateMedicine(Long id, UpdateMedicineRequest request);

    void deleteMedicine(Long id);

    List<MedicineResponse> getAllMedicines();
}
