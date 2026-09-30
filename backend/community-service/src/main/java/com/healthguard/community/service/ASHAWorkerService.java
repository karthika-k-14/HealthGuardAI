package com.healthguard.community.service;

import com.healthguard.community.dto.ASHAWorkerRequest;
import com.healthguard.community.dto.ASHAWorkerResponse;
import com.healthguard.community.dto.UpdateASHAWorkerRequest;

import java.util.List;

public interface ASHAWorkerService {

    ASHAWorkerResponse createWorker(ASHAWorkerRequest request);

    ASHAWorkerResponse getWorkerById(Long id);

    ASHAWorkerResponse getWorkerByWorkerId(String workerId);

    ASHAWorkerResponse updateWorker(Long id, UpdateASHAWorkerRequest request);

    void deleteWorker(Long id);

    List<ASHAWorkerResponse> getAllWorkers(String district);
}
