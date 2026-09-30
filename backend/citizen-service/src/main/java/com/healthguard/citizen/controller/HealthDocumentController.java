package com.healthguard.citizen.controller;

import com.healthguard.citizen.entity.HealthDocument;
import com.healthguard.citizen.enums.DocumentType;
import com.healthguard.citizen.service.HealthDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class HealthDocumentController {

    private final HealthDocumentService healthDocumentService;

    @PostMapping("/upload")
    public ResponseEntity<HealthDocument> uploadDocument(
            @RequestParam("citizenId") Long citizenId,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam("file") MultipartFile file) {
        HealthDocument uploaded = healthDocumentService.uploadDocument(citizenId, documentType, file);
        return ResponseEntity.ok(uploaded);
    }

    @GetMapping("/citizen/{citizenId}")
    public ResponseEntity<?> getDocumentsByCitizenId(
            @PathVariable("citizenId") Long citizenId,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        if (page != null) {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            return ResponseEntity.ok(healthDocumentService.getDocumentsByCitizenId(citizenId, pageable));
        }
        return ResponseEntity.ok(healthDocumentService.getDocumentsByCitizenId(citizenId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthDocument> getDocumentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(healthDocumentService.getDocumentById(id));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable("id") Long id,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        HealthDocument doc = healthDocumentService.getDocumentById(id);
        Resource resource = healthDocumentService.loadDocumentResource(id, requesterUserId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable("id") Long id,
            @RequestParam(value = "requesterUserId", required = false) Long requesterUserId) {
        healthDocumentService.deleteDocument(id, requesterUserId);
        return ResponseEntity.noContent().build();
    }
}

