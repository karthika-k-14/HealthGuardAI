package com.healthguard.gateway.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteValidatorTest {

    private RouteValidator routeValidator;

    @BeforeEach
    void setUp() {
        routeValidator = new RouteValidator();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "/swagger-ui/index.html",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/v3/api-docs/swagger-config",
            "/api/citizens/v3/api-docs",
            "/api/community/v3/api-docs",
            "/api/admin/v3/api-docs",
            "/api/ai/v3/api-docs",
            "/actuator/health"
    })
    @DisplayName("Whitelisted Swagger/OpenAPI and health endpoints should return isSecured = false")
    void testPublicEndpoints_NotSecured(String path) {
        ServerHttpRequest request = MockServerHttpRequest.get(path).build();
        assertFalse(routeValidator.isSecured.test(request), "Expected path to be whitelisted (isSecured = false): " + path);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "/api/citizens/profile",
            "/api/community/phc",
            "/api/admin/users",
            "/api/ai/triage"
    })
    @DisplayName("Protected business endpoints should return isSecured = true")
    void testProtectedEndpoints_IsSecured(String path) {
        ServerHttpRequest request = MockServerHttpRequest.get(path).build();
        assertTrue(routeValidator.isSecured.test(request), "Expected path to be secured (isSecured = true): " + path);
    }
}
