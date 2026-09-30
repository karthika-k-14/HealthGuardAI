package com.healthguard.ai.service;

public interface LanguageService {
    String detectLanguage(String text);
    String getLanguageName(String isoCode);
}
