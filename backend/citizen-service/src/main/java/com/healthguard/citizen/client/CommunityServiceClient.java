package com.healthguard.citizen.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(
    name = "community-service",
    url = "${community.service.url:http://localhost:8083}"
)
public interface CommunityServiceClient {

    @PostMapping("/api/emergency-alerts/create")
    Map<String, Object> createEmergencyAlert(@RequestBody Map<String, Object> request);

    @GetMapping("/api/emergency-alerts/citizen/{citizenId}")
    Map<String, Object> getCitizenEmergencyAlerts(@PathVariable("citizenId") Long citizenId);
}
