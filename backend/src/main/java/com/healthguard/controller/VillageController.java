package com.healthguard.controller;

import com.healthguard.dto.VillageResponse;
import com.healthguard.service.VillageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only admin village listing. Covered by the existing "/admin/**" ->
 * ROLE_ADMIN matcher in {@code SecurityConfig}, so no security
 * configuration changes are needed. Exists to back the Broadcast
 * Notification "Send to Village" target picker - a full Village CRUD
 * module is out of scope here.
 */
@RestController
@RequestMapping("/admin/villages")
@RequiredArgsConstructor
@Tag(name = "Villages", description = "Read-only village listing for admin use")
public class VillageController {

    private final VillageService villageService;

    @GetMapping
    @Operation(summary = "List all villages")
    public ResponseEntity<List<VillageResponse>> getAllVillages() {
        return ResponseEntity.ok(villageService.getAllVillages());
    }
}
