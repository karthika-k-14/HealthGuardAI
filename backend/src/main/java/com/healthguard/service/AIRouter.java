package com.healthguard.service;

import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

/**
 * AI Decision Engine (AIRouter).
 * Classifies incoming user questions into DATABASE, GEMINI, or HYBRID.
 */
@Component
public class AIRouter {

    public enum SourceType {
        DATABASE,
        GEMINI,
        HYBRID
    }

    private static final Set<String> HYBRID_TRIGGERS = Set.of(
            "explain my prescription",
            "explain prescription",
            "explain my blood test",
            "explain my report",
            "explain my health record",
            "explain report",
            "which scheme is best",
            "best scheme for me",
            "which government scheme",
            "explain my medicine",
            "analyse my health",
            "analyze my health"
    );

    private static final Set<String> DATABASE_TRIGGERS = Set.of(
            "my health record", "my health records",
            "my prescription", "my prescriptions",
            "my notification", "my notifications",
            "my emergency contact", "my emergency contacts",
            "my family", "my family members", "my family member",
            "my government scheme", "my government schemes", "my scheme", "my schemes",
            "my scheme application", "my scheme applications",
            "my hospital", "my hospitals",
            "my campaign", "my campaigns",
            "my article", "my awareness article", "my awareness articles",
            "my sos", "my sos request",
            "my workflow", "my case",
            "my medicine", "my medicines",
            "my profile", "my dashboard", "my analytics",
            "my phc", "my village"
    );

    /**
     * Classifies a message into SourceType.
     *
     * @param message User prompt message
     * @return DATABASE | GEMINI | HYBRID
     */
    public SourceType route(String message) {
        if (message == null || message.trim().isEmpty()) {
            return SourceType.GEMINI;
        }

        String lower = message.toLowerCase(Locale.ROOT).trim();

        // 1. Check for HYBRID queries (Explanation of personal DB data via AI)
        for (String trigger : HYBRID_TRIGGERS) {
            if (lower.contains(trigger)) {
                return SourceType.HYBRID;
            }
        }

        if ((lower.contains("explain") || lower.contains("suggest") || lower.contains("best")) 
                && (lower.contains("my ") || lower.contains("me"))) {
            return SourceType.HYBRID;
        }

        // 2. Check for DATABASE queries (Personal user data retrieval)
        for (String trigger : DATABASE_TRIGGERS) {
            if (lower.contains(trigger)) {
                return SourceType.DATABASE;
            }
        }

        if (lower.startsWith("my ") || lower.contains(" my ")) {
            return SourceType.DATABASE;
        }

        // 3. Fallback to GEMINI for general health knowledge queries
        return SourceType.GEMINI;
    }
}
