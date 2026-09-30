package com.healthguard.citizen.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".pdf", ".png", ".jpg", ".jpeg"
    );

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads/documents").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the upload directory for documents.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String lowerCaseName = originalFileName.toLowerCase();

        // 1. Extension Whitelist Check
        boolean validExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerCaseName::endsWith);
        if (!validExtension) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, PNG, and JPG/JPEG files are allowed.");
        }

        // 2. MIME Content-Type Whitelist Check
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid content type: " + contentType + ". Only PDF, PNG, and JPG/JPEG files are allowed.");
        }

        String cleanFileName = UUID.randomUUID() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");

        try {
            Path targetLocation = this.fileStorageLocation.resolve(cleanFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Unauthorized file access: Path traversal attempt detected.");
            }
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + cleanFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String filePathStr) {
        try {
            Path filePath = Paths.get(filePathStr).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Unauthorized file access: Path traversal attempt detected.");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + filePathStr);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePathStr, ex);
        }
    }

    public void deleteFile(String filePathStr) {
        try {
            Path filePath = Paths.get(filePathStr).normalize();
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Unauthorized file access: Path traversal attempt detected.");
            }
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            // Log warning
        }
    }
}

