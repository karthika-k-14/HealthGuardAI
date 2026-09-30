package com.healthguard.auth.service;

public interface EmailService {
    void sendWelcomeEmail(String toEmail, String fullName, String role, String tempPassword);
}
