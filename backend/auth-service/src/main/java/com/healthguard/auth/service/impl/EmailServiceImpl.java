package com.healthguard.auth.service.impl;

import com.healthguard.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendWelcomeEmail(String toEmail, String fullName, String role, String tempPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Welcome to HealthGuard AI");
            message.setText("Hello " + fullName + ",\n\n" +
                    "Your HealthGuard AI account has been created.\n\n" +
                    "Role:\n" + role + "\n\n" +
                    "Email:\n" + toEmail + "\n\n" +
                    "Temporary Password:\n" + tempPassword + "\n\n" +
                    "Please login and change your password immediately.\n\n" +
                    "HealthGuard AI Team");

            mailSender.send(message);
            log.info("Invitation email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}: {}", toEmail, e.getMessage());
        }
    }
}
