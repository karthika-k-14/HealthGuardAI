package com.healthguard.gateway.security;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.function.Predicate;

/**
 * Validator responsible for determining whether an incoming request requires JWT authentication.
 * Whitelists Swagger/OpenAPI documentation endpoints and public health endpoints.
 */
@Component
public class RouteValidator {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * List of endpoints and path patterns that are publicly accessible without JWT tokens.
     */
    public static final List<String> OPEN_API_ENDPOINTS = List.of(
            "/",
            "/index.html",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/api/citizens/v3/api-docs",
            "/api/citizens/v3/api-docs/**",
            "/api/community/v3/api-docs",
            "/api/community/v3/api-docs/**",
            "/api/phc/v3/api-docs",
            "/api/phc/v3/api-docs/**",
            "/api/admin/v3/api-docs",
            "/api/admin/v3/api-docs/**",
            "/api/ai/v3/api-docs",
            "/api/ai/v3/api-docs/**",
            "/api/auth/v3/api-docs",
            "/api/auth/v3/api-docs/**",
            "/api/pharmacist/v3/api-docs",
            "/api/pharmacist/v3/api-docs/**",
            "/api/ai/health/openapi.json",
            "/actuator/health",
            "/actuator/health/**",
            "/favicon.ico",
            "/api/auth/**",
            "/api/ai/health/risk-assessment",
            "/api/ai/health/predict-risk",
            "/api/ai/health/public/**",
            "/api/citizen/schemes/**",
            "/api/citizen/schemes",
            "/api/schemes/**",
            "/api/schemes",
            "/api/awareness/**",
            "/api/awareness",
            "/api/citizen/awareness/**",
            "/api/citizen/awareness",
            "/api/articles/**",
            "/api/articles"
    );

    /**
     * Predicate checking if a request requires JWT authentication.
     * Returns false if the request path matches any whitelisted public endpoint.
     */
    public Predicate<ServerHttpRequest> isSecured = request -> {
        if (request.getMethod() != null && "OPTIONS".equalsIgnoreCase(request.getMethod().name())) {
            return false;
        }
        String path = request.getURI().getPath();
        return OPEN_API_ENDPOINTS.stream()
                .noneMatch(uri -> pathMatcher.match(uri, path));
    };
}
