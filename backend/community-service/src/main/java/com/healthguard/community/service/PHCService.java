package com.healthguard.community.service;

import com.healthguard.community.dto.PHCRequest;
import com.healthguard.community.dto.PHCResponse;
import com.healthguard.community.dto.UpdatePHCRequest;

import java.util.List;

public interface PHCService {

    PHCResponse createPHC(PHCRequest request);

    PHCResponse getPHCById(Long id);

    PHCResponse getPHCByCode(String phcCode);

    PHCResponse updatePHC(Long id, UpdatePHCRequest request);

    void deletePHC(Long id);

    List<PHCResponse> getAllPHCs(String district);
}
