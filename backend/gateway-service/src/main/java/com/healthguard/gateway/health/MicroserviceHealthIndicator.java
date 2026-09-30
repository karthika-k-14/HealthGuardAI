package com.healthguard.gateway.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component("microservices")
@Slf4j
public class MicroserviceHealthIndicator implements ReactiveHealthIndicator {

    private final WebClient webClient;

    public MicroserviceHealthIndicator(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    private static class ServiceCheck {
        final String name;
        final String url;

        ServiceCheck(String name, String url) {
            this.name = name;
            this.url = url;
        }
    }

    @Override
    public Mono<Health> health() {
        List<ServiceCheck> services = List.of(
            new ServiceCheck("auth-service", "http://localhost:8081/actuator/health"),
            new ServiceCheck("citizen-service", "http://localhost:8082/actuator/health"),
            new ServiceCheck("community-service", "http://localhost:8083/actuator/health"),
            new ServiceCheck("pharmacist-service", "http://localhost:8084/actuator/health"),
            new ServiceCheck("admin-service", "http://localhost:8085/actuator/health"),
            new ServiceCheck("health-ai-service", "http://localhost:8000/health")
        );

        return Flux.fromIterable(services)
                .flatMap(svc -> checkServiceHealth(svc.name, svc.url))
                .collectList()
                .map(results -> {
                    Map<String, Object> details = new LinkedHashMap<>();
                    boolean allUp = true;

                    for (Map<String, String> res : results) {
                        String name = res.get("name");
                        String status = res.get("status");
                        details.put(name, res);
                        if (!"UP".equalsIgnoreCase(status)) {
                            allUp = false;
                        }
                    }

                    if (allUp) {
                        return Health.up().withDetails(details).build();
                    } else {
                        return Health.down().withDetails(details).build();
                    }
                });
    }

    private Mono<Map<String, String>> checkServiceHealth(String name, String url) {
        return webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(3))
                .map(response -> {
                    Map<String, String> map = new LinkedHashMap<>();
                    map.put("name", name);
                    map.put("status", "UP");
                    map.put("url", url);
                    return map;
                })
                .onErrorResume(ex -> {
                    log.warn("Health check failed for {}: {}", name, ex.getMessage());
                    Map<String, String> map = new LinkedHashMap<>();
                    map.put("name", name);
                    map.put("status", "DOWN");
                    map.put("error", ex.getMessage() != null ? ex.getMessage() : "Unknown health check error");
                    map.put("url", url);
                    return Mono.just(map);
                });
    }
}
