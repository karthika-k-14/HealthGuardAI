package com.healthguard.ai.service.impl;

import com.healthguard.ai.service.LanguageService;
import org.springframework.stereotype.Service;

@Service
public class LanguageServiceImpl implements LanguageService {

    @Override
    public String detectLanguage(String text) {
        if (text == null || text.isBlank()) {
            return "en";
        }

        for (char c : text.toCharArray()) {
            // Tamil: \u0B80 - \u0BFF
            if (c >= '\u0B80' && c <= '\u0BFF') return "ta";
            // Odia: \u0B00 - \u0B7F
            if (c >= '\u0B00' && c <= '\u0B7F') return "od";
            // Hindi / Devanagari: \u0900 - \u097F
            if (c >= '\u0900' && c <= '\u097F') return "hi";
            // Telugu: \u0C00 - \u0C7F
            if (c >= '\u0C00' && c <= '\u0C7F') return "te";
            // Kannada: \u0C80 - \u0CFF
            if (c >= '\u0C80' && c <= '\u0CFF') return "kn";
            // Malayalam: \u0D00 - \u0D7F
            if (c >= '\u0D00' && c <= '\u0D7F') return "ml";
            // Bengali: \u0980 - \u09FF
            if (c >= '\u0980' && c <= '\u09FF') return "bn";
        }

        return "en";
    }

    @Override
    public String getLanguageName(String isoCode) {
        if (isoCode == null) return "English";
        switch (isoCode.toLowerCase()) {
            case "ta": return "Tamil";
            case "hi": return "Hindi";
            case "od":
            case "or": return "Odia";
            case "te": return "Telugu";
            case "kn": return "Kannada";
            case "ml": return "Malayalam";
            case "bn": return "Bengali";
            default: return "English";
        }
    }
}
