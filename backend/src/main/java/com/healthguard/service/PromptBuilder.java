package com.healthguard.service;

import com.healthguard.entity.User;
import org.springframework.stereotype.Component;

/**
 * Builds standard system prompts and contextual user instructions for Google Gemini AI.
 */
@Component
public class PromptBuilder {

    private static final String SYSTEM_INSTRUCTION = """
            You are the HealthGuard AI Assistant, an intelligent healthcare guide for the HealthGuard platform.
            
            IMPORTANT SAFETY RULES:
            1. Never claim to be a medical doctor.
            2. Never prescribe specific medicine dosages or treatments.
            3. Never provide absolute diagnostic conclusions.
            4. Never attempt to replace professional healthcare workers, doctors, or emergency services.
            5. Explain medical terms and health information in plain, simple, compassionate language.
            6. If emergency symptoms (e.g. chest pain, difficulty breathing, severe bleeding, sudden paralysis) are mentioned, explicitly instruct the user to seek immediate emergency medical care (call 108/112 or visit an emergency room).
            """;

    /**
     * Builds prompt for GEMINI general health questions.
     */
    public String buildGeneralPrompt(String userMessage) {
        return SYSTEM_INSTRUCTION + "\n\nUser Question:\n" + userMessage;
    }

    /**
     * Builds prompt for HYBRID queries (combining real database records with AI reasoning/explanation).
     */
    public String buildHybridPrompt(User user, String userMessage, String dbDataSummary) {
        StringBuilder sb = new StringBuilder(SYSTEM_INSTRUCTION);
        sb.append("\n\nAUTHENTICATED USER CONTEXT:\n");
        sb.append("Name: ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
        if (user.getGender() != null) sb.append("Gender: ").append(user.getGender()).append("\n");
        if (user.getAge() != null) sb.append("Age: ").append(user.getAge()).append("\n");
        
        sb.append("\nREAL DATABASE HEALTH RECORDS FROM HEALTHGUARD:\n");
        sb.append(dbDataSummary).append("\n");
        
        sb.append("\nUSER QUESTION:\n").append(userMessage).append("\n\n");
        sb.append("INSTRUCTION:\n");
        sb.append("Use the user's real database health records provided above to answer their question. ");
        sb.append("Explain their records/prescriptions/schemes clearly and simply. ");
        sb.append("Do not invent fake medical records — rely strictly on the database context above.");

        return sb.toString();
    }
}
