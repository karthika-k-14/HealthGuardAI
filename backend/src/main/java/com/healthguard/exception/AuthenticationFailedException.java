package com.healthguard.exception;

/**
 * Thrown when login credentials (email/phone + password) are invalid,
 * or the account is not usable (e.g. deactivated). Mapped to HTTP 401
 * by the global exception handler.
 */
public class AuthenticationFailedException extends RuntimeException {

    public AuthenticationFailedException(String message) {
        super(message);
    }
}
