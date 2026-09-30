package com.healthguard.admin.service;

public interface EmailService {

    void sendInvitationEmail(String recipientEmail, String fullName, String role, String temporaryPassword);

    void sendWelcomeEmail(String toEmail, String fullName, String role, String tempPassword);
}
