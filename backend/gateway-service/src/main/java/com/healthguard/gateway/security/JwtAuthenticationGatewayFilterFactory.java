package com.healthguard.gateway.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.support.ShortcutConfigurable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component("JwtAuthentication")
@Slf4j
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private final JwtUtils jwtUtils;
    private final RouteValidator routeValidator;

    public JwtAuthenticationGatewayFilterFactory(JwtUtils jwtUtils, RouteValidator routeValidator) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
        this.routeValidator = routeValidator;
    }

    @Override
    public String name() {
        return "JwtAuthentication";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Config {
        private Object requiredRoles;
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("requiredRoles");
    }

    @Override
    public ShortcutConfigurable.ShortcutType shortcutType() {
        return ShortcutConfigurable.ShortcutType.GATHER_LIST;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Bypass JWT validation for whitelisted OpenAPI / Swagger / Health endpoints
            if (!routeValidator.isSecured.test(request)) {
                log.debug("Bypassing JWT validation for whitelisted endpoint: {}", request.getURI().getPath());
                return chain.filter(exchange);
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization Header for URI: {}", request.getURI());
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization Header format for URI: {}", request.getURI());
                return onError(exchange, "Invalid Authorization Header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtUtils.validateToken(token)) {
                log.warn("Invalid or expired JWT token for URI: {}", request.getURI());
                return onError(exchange, "Invalid or expired JWT token", HttpStatus.UNAUTHORIZED);
            }

            List<String> tokenRoles = jwtUtils.getRolesFromToken(token);
            String email = jwtUtils.getEmailFromToken(token);
            String userId = jwtUtils.getUserIdFromToken(token);
            String primaryRole = tokenRoles.isEmpty() ? "CITIZEN" : tokenRoles.get(0);

            // Log username, role, and authorities for every authenticated request
            log.info("JWT Filter Auth Check -> username: {}, role: {}, authorities: {}, path: {}", 
                    email, primaryRole, tokenRoles, request.getURI().getPath());

            List<String> allowedRoles = new ArrayList<>();
            if (config.getRequiredRoles() != null) {
                if (config.getRequiredRoles() instanceof List<?> list) {
                    for (Object item : list) {
                        if (item != null) {
                            allowedRoles.addAll(Arrays.stream(item.toString().replace("'", "").replace("\"", "").split(","))
                                    .map(String::trim)
                                    .map(String::toUpperCase)
                                    .filter(s -> !s.isEmpty())
                                    .toList());
                        }
                    }
                } else if (config.getRequiredRoles() instanceof String str) {
                    allowedRoles.addAll(Arrays.stream(str.replace("'", "").replace("\"", "").split(","))
                            .map(String::trim)
                            .map(String::toUpperCase)
                            .filter(s -> !s.isEmpty())
                            .toList());
                }
            }

            if (!allowedRoles.isEmpty()) {
                boolean hasRole = tokenRoles.stream().anyMatch(role -> {
                    String cleanRole = role.trim().toUpperCase();
                    String unprefixed = cleanRole.startsWith("ROLE_") ? cleanRole.substring(5) : cleanRole;
                    String prefixed = cleanRole.startsWith("ROLE_") ? cleanRole : "ROLE_" + cleanRole;
                    
                    return allowedRoles.contains(cleanRole) || 
                           allowedRoles.contains(unprefixed) || 
                           allowedRoles.contains(prefixed);
                });

                if (!hasRole) {
                    log.warn("Access Denied for user {} (roles: {}) required: {} on URI: {}", email, tokenRoles, allowedRoles, request.getURI());
                    return onError(exchange, "Access Denied: Insufficient Role Permissions", HttpStatus.FORBIDDEN);
                }
            }

            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-User-Email", email)
                    .header("X-User-Role", primaryRole)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json");

        String jsonResponseBody = String.format(
            "{\"status\":\"%s\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
            httpStatus.name(),
            err,
            java.time.LocalDateTime.now()
        );

        return response.writeWith(Mono.just(response.bufferFactory().wrap(jsonResponseBody.getBytes())));
    }
}
