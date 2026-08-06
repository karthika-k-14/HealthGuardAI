package com.healthguard.exception;

/**
 * Thrown when a request cannot be processed due to invalid
 * client input that isn't already caught by bean validation.
 * Mapped to HTTP 400 by the global exception handler.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
