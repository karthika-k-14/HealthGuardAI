package com.healthguard.gateway.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * Controller to handle browser favicon requests gracefully, returning 204 No Content
 * to prevent 404 error log noise in Gateway service.
 */
@RestController
public class FaviconController {

    @GetMapping("/favicon.ico")
    public Mono<ResponseEntity<Void>> favicon() {
        return Mono.just(ResponseEntity.noContent().build());
    }
}
