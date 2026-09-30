package com.healthguard.citizen.config;

import com.healthguard.citizen.exception.AIServiceUnavailableException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

@Slf4j
public class HealthAIErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign Error during call to method {}: status {}", methodKey, response.status());
        
        if (response.status() >= 500 || response.status() == 503 || response.status() == 504) {
            return new AIServiceUnavailableException("Health AI Service is unavailable (HTTP " + response.status() + ")");
        }
        if (response.status() == 404) {
            return new AIServiceUnavailableException("Health AI Endpoint not found: " + methodKey);
        }
        if (response.status() >= 400 && response.status() < 500) {
            return new AIServiceUnavailableException("Health AI Service returned bad request (HTTP " + response.status() + ")");
        }
        return defaultErrorDecoder.decode(methodKey, response);
    }
}
