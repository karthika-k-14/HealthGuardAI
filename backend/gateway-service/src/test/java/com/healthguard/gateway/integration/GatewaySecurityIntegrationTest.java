package com.healthguard.gateway.integration;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@ActiveProfiles("test")
class GatewaySecurityIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971";

    private String generateTestToken(String subject, Long userId, String role, long ttlMillis) {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .subject(subject)
                .claims(Map.of("userId", userId, "email", subject, "role", role))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + ttlMillis))
                .signWith(key)
                .compact();
    }

    @Test
    @DisplayName("Secured Endpoint - Missing JWT returns 401 Unauthorized")
    void testSecuredEndpoint_MissingJwt_Returns401() {
        webTestClient.get()
                .uri("/api/citizens/profile")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo("UNAUTHORIZED")
                .jsonPath("$.message").isEqualTo("Missing Authorization Header");
    }

    @Test
    @DisplayName("Secured Endpoint - Invalid JWT Signature returns 401 Unauthorized")
    void testSecuredEndpoint_InvalidJwt_Returns401() {
        webTestClient.get()
                .uri("/api/citizens/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.jwt.token")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo("UNAUTHORIZED")
                .jsonPath("$.message").isEqualTo("Invalid or expired JWT token");
    }

    @Test
    @DisplayName("Secured Endpoint - Expired JWT returns 401 Unauthorized")
    void testSecuredEndpoint_ExpiredJwt_Returns401() {
        String expiredToken = generateTestToken("user@healthguard.app", 10L, "CITIZEN", -3600000); // 1 hr ago

        webTestClient.get()
                .uri("/api/citizens/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.status").isEqualTo("UNAUTHORIZED")
                .jsonPath("$.message").isEqualTo("Invalid or expired JWT token");
    }

    @Test
    @DisplayName("Role Authorization Failure - Citizen requesting Admin Route returns 403 Forbidden")
    void testRoleAuthorization_CitizenAccessingAdminRoute_Returns403() {
        String citizenToken = generateTestToken("citizen@healthguard.app", 1L, "CITIZEN", 3600000);

        webTestClient.get()
                .uri("/api/admin/dashboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + citizenToken)
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.status").isEqualTo("FORBIDDEN")
                .jsonPath("$.message").isEqualTo("Access Denied: Insufficient Role Permissions");
    }

    @Test
    @DisplayName("Public Auth Endpoint - Bypasses JWT validation")
    void testPublicEndpoint_BypassesJwtValidation() {
        webTestClient.post()
                .uri("/api/auth/login")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }

    @Test
    @DisplayName("Actuator Health Endpoint - Publicly accessible")
    void testActuatorHealth_Public() {
        webTestClient.get()
                .uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    @DisplayName("Citizen Swagger API Docs - Bypasses JWT validation")
    void testCitizenSwaggerApiDocs_BypassesJwtValidation() {
        webTestClient.get()
                .uri("/api/citizens/v3/api-docs")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }

    @Test
    @DisplayName("Community Swagger API Docs - Bypasses JWT validation")
    void testCommunitySwaggerApiDocs_BypassesJwtValidation() {
        webTestClient.get()
                .uri("/api/community/v3/api-docs")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }

    @Test
    @DisplayName("Admin Swagger API Docs - Bypasses JWT validation")
    void testAdminSwaggerApiDocs_BypassesJwtValidation() {
        webTestClient.get()
                .uri("/api/admin/v3/api-docs")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }

    @Test
    @DisplayName("AI Swagger API Docs - Bypasses JWT validation")
    void testAISwaggerApiDocs_BypassesJwtValidation() {
        webTestClient.get()
                .uri("/api/ai/v3/api-docs")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }

    @Test
    @DisplayName("Swagger UI Index - Bypasses JWT validation")
    void testSwaggerUiIndex_BypassesJwtValidation() {
        webTestClient.get()
                .uri("/swagger-ui/index.html")
                .exchange()
                .expectStatus().value(status -> {
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.UNAUTHORIZED.value(), status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(HttpStatus.FORBIDDEN.value(), status);
                });
    }
}
