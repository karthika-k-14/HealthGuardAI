package com.healthguard.admin.service.impl;

import com.healthguard.admin.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendInvitationEmail(String recipientEmail, String fullName, String role, String temporaryPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject("Welcome to HealthGuard AI");
            message.setText("Hello " + fullName + ",\n\n" +
                    "Your HealthGuard AI account has been created.\n\n" +
                    "Role: " + role + "\n\n" +
                    "Email: " + recipientEmail + "\n\n" +
                    "Temporary Password: " + temporaryPassword + "\n\n" +
                    "Please login and change your password immediately.\n\n" +
                    "HealthGuard AI Team");

            mailSender.send(message);
            log.info("Invitation email sent successfully to {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}: {}", recipientEmail, e.getMessage());
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String fullName, String role, String tempPassword) {
        sendInvitationEmail(toEmail, fullName, role, tempPassword);
    }
}
