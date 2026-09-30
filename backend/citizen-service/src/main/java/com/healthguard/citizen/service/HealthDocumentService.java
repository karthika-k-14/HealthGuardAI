package com.healthguard.citizen.service;

import com.healthguard.citizen.entity.HealthDocument;
import com.healthguard.citizen.enums.DocumentType;
import com.healthguard.citizen.repository.HealthDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthDocumentService {

    private final HealthDocumentRepository healthDocumentRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public HealthDocument uploadDocument(Long citizenId, DocumentType documentType, MultipartFile file) {
        String savedPath = fileStorageService.storeFile(file);

        HealthDocument document = HealthDocument.builder()
                .citizenId(citizenId != null ? citizenId : 1L)
                .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "Health_Document")
                .documentType(documentType != null ? documentType : DocumentType.OTHER)
                .filePath(savedPath)
                .fileSize(file.getSize())
                .build();

        return healthDocumentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public List<HealthDocument> getDocumentsByCitizenId(Long citizenId) {
        return healthDocumentRepository.findByCitizenIdOrderByUploadedAtDesc(citizenId);
    }

    @Transactional(readOnly = true)
    public Page<HealthDocument> getDocumentsByCitizenId(Long citizenId, Pageable pageable) {
        return healthDocumentRepository.findByCitizenIdOrderByUploadedAtDesc(citizenId, pageable);
    }

    @Transactional(readOnly = true)
    public HealthDocument getDocumentById(Long id) {
        return healthDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Resource loadDocumentResource(Long id) {
        HealthDocument doc = getDocumentById(id);
        return fileStorageService.loadFileAsResource(doc.getFilePath());
    }

    @Transactional(readOnly = true)
    public Resource loadDocumentResource(Long id, Long currentUserId) {
        HealthDocument doc = getDocumentById(id);
        if (currentUserId != null && !doc.getCitizenId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to access this document.");
        }
        return fileStorageService.loadFileAsResource(doc.getFilePath());
    }

    @Transactional
    public void deleteDocument(Long id) {
        HealthDocument doc = getDocumentById(id);
        fileStorageService.deleteFile(doc.getFilePath());
        healthDocumentRepository.deleteById(id);
    }

    @Transactional
    public void deleteDocument(Long id, Long currentUserId) {
        HealthDocument doc = getDocumentById(id);
        if (currentUserId != null && !doc.getCitizenId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to delete this document.");
        }
        fileStorageService.deleteFile(doc.getFilePath());
        healthDocumentRepository.deleteById(id);
    }
}

