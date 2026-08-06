package com.healthguard.service;

import com.healthguard.dto.HealthResponse;
import org.springframework.stereotype.Service;

/**
 * Provides the current health status of the backend service.
 * Kept as its own service (rather than inline in the controller)
 * so future checks (DB connectivity, downstream services, etc.)
 * can be added here without touching the controller layer.
 */
@Service
public class HealthService {

    private static final String SERVICE_NAME = "HealthGuard Backend";
    private static final String VERSION = "1.0";

    public HealthResponse getHealthStatus() {
        return HealthResponse.builder()
                .status("UP")
                .service(SERVICE_NAME)
                .version(VERSION)
                .build();
    }
}
