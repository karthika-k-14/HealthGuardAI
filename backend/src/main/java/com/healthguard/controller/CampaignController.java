package com.healthguard.controller;

import com.healthguard.dto.CampaignRequest;
import com.healthguard.dto.CampaignResponse;
import com.healthguard.service.CampaignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Campaign CRUD endpoints.
 * <p>
 * Reads ({@code /campaigns/**}) are not under "/admin/**", "/citizen/**",
 * etc. so they fall to the "anyRequest().authenticated()" rule in
 * {@code SecurityConfig} - reachable by any authenticated role (Health
 * Officers and Citizens browsing campaigns, in particular). Writes
 * ({@code /admin/campaigns/**}) are covered by the existing "/admin/**"
 * -&gt; ROLE_ADMIN matcher.
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Campaigns", description = "Public health campaign management")
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping("/campaigns")
    @Operation(summary = "List all campaigns", description = "Returns every health campaign.")
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/campaigns/{campaignId}")
    @Operation(summary = "Get campaign by ID", description = "Returns details for a single campaign.")
    public ResponseEntity<CampaignResponse> getCampaignById(@PathVariable Long campaignId) {
        return ResponseEntity.ok(campaignService.getCampaignById(campaignId));
    }

    @PostMapping("/admin/campaigns")
    @Operation(summary = "Create a campaign", description = "Creates a new public health campaign (Admin only).")
    public ResponseEntity<CampaignResponse> createCampaign(@Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createCampaign(request));
    }

    @PutMapping("/admin/campaigns/{campaignId}")
    @Operation(summary = "Update a campaign", description = "Updates an existing campaign (Admin only).")
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable Long campaignId,
                                                             @Valid @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.updateCampaign(campaignId, request));
    }

    @DeleteMapping("/admin/campaigns/{campaignId}")
    @Operation(summary = "Delete a campaign", description = "Deletes a campaign by ID (Admin only).")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long campaignId) {
        campaignService.deleteCampaign(campaignId);
        return ResponseEntity.noContent().build();
    }
}

