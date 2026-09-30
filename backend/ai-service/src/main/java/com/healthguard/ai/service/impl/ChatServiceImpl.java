package com.healthguard.ai.service.impl;

import com.healthguard.ai.client.AiModelClient;
import com.healthguard.ai.client.OllamaClient;
import com.healthguard.ai.dto.AdminAnalyticsContext;
import com.healthguard.ai.dto.ChatRequest;
import com.healthguard.ai.dto.ChatResponse;
import com.healthguard.ai.entity.ChatHistory;
import com.healthguard.ai.repository.ChatHistoryRepository;
import com.healthguard.ai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final ChatHistoryRepository chatHistoryRepository;
    private final OllamaClient ollamaClient;
    private final AiModelClient aiModelClient;
    private final JdbcTemplate jdbcTemplate;

    private static final String CHAT_SYSTEM_PROMPT = 
        "You are HealthGuard AI, an evidence-based healthcare assistant for Indian citizens.\n" +
        "STRICT CHAT MODE RULES:\n" +
        "1. KEEP YOUR RESPONSE UNDER 50 WORDS.\n" +
        "2. Do NOT generate Risk Level, Possible Conditions, Recommendations, or Disclaimers.\n" +
        "3. Respond conversationally, empathetically, and directly.\n" +
        "4. Ask ONLY 1-3 simple follow-up questions at a time.\n" +
        "5. For disease topics (e.g. Dengue, Diabetes), give a 1-sentence definition and offer 4 options: 1. Symptoms 2. Prevention 3. Recovery guidance 4. Nearby hospitals.";

    private static final String ADMIN_SYSTEM_PROMPT = 
        "You are HealthGuard Admin Assistant.\n\n" +
        "Use ONLY the supplied metrics.\n" +
        "Never invent counts, percentages, growth rates, trends, users, campaigns, hospitals, alerts, or statistics.\n" +
        "If data is unavailable explicitly say Data unavailable.\n" +
        "Do not hallucinate.\n" +
        "Do not generate fictional platform information.\n" +
        "Never ask about symptoms, diseases, medical conditions, patient diagnoses, or treatments.\n" +
        "Always respond as a professional, executive administrative analytics assistant under 60 words.";

    private AdminAnalyticsContext fetchRealPlatformMetrics() {
        return AdminAnalyticsContext.builder()
                .totalUsers(getCountFromQuery("SELECT COUNT(*) FROM users"))
                .totalCitizens(getCountFromQuery("SELECT COUNT(*) FROM citizens"))
                .totalAdmins(getCountFromQuery("SELECT COUNT(*) FROM admins"))
                .totalHealthOfficers(getCountFromQuery("SELECT COUNT(*) FROM health_officers"))
                .totalAshaWorkers(getCountFromQuery("SELECT COUNT(*) FROM asha_workers"))
                .totalPharmacists(getCountFromQuery("SELECT COUNT(*) FROM pharmacists"))
                .totalHospitals(getCountFromQuery("SELECT COUNT(*) FROM hospitals"))
                .totalPhcs(getCountFromQuery("SELECT COUNT(*) FROM primary_health_centres"))
                .totalCampaigns(getCountFromQuery("SELECT COUNT(*) FROM campaigns"))
                .totalHealthArticles(getCountFromQuery("SELECT COUNT(*) FROM health_articles"))
                .totalMedicines(getCountFromQuery("SELECT COUNT(*) FROM medicines"))
                .totalPrescriptions(getCountFromQuery("SELECT COUNT(*) FROM prescriptions"))
                .totalHealthRecords(getCountFromQuery("SELECT COUNT(*) FROM health_records"))
                .totalHomeVisits(getCountFromQuery("SELECT COUNT(*) FROM home_visits"))
                .totalWorkflows(getCountFromQuery("SELECT COUNT(*) FROM workflows"))
                .totalNotifications(getCountFromQuery("SELECT COUNT(*) FROM notifications"))
                .totalChatHistory(getCountFromQuery("SELECT COUNT(*) FROM chat_history"))
                .totalSymptomAssessments(getCountFromQuery("SELECT COUNT(*) FROM symptom_assessments"))
                .totalTriageSessions(getCountFromQuery("SELECT COUNT(*) FROM triage_sessions"))
                .totalOutbreakAlerts(getCountFromQuery("SELECT COUNT(*) FROM outbreak_alerts"))
                .totalSurveillanceReports(getCountFromQuery("SELECT COUNT(*) FROM disease_surveillance_reports"))
                .totalAuditLogs(getCountFromQuery("SELECT COUNT(*) FROM audit_logs"))
                .build();
    }

    private String getCountFromQuery(String sql) {
        if (jdbcTemplate == null) return "Data unavailable";
        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count != null ? String.valueOf(count) : "0";
        } catch (Exception e) {
            return "Data unavailable";
        }
    }

    private boolean isAdminTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return false;
        }
        switch (topic) {
            case "dailySummary":
            case "keyTrends":
            case "adminRecommendations":
            case "resourcePlanning":
            case "riskAttention":
            case "campaignReview":
            case "executiveReport":
                return true;
            default:
                return false;
        }
    }

    private String buildAdminPrompt(String topic, String question, AdminAnalyticsContext context) {
        String metricsHeader = context != null ? context.toFormattedMetrics() + "\n" : "";
        String basePrompt = "";

        if (topic == null) {
            basePrompt = question;
        } else {
            switch (topic) {
                case "executiveReport":
                    basePrompt = "Generate an executive platform report including: platform overview, user statistics, operational statistics, healthcare statistics, alerts and monitoring, and recommendations. Context/Question: " + question;
                    break;
                case "dailySummary":
                    basePrompt = "Generate today's operational summary including: today's operational metrics, notifications, workflows, and recent activity. Context/Question: " + question;
                    break;
                case "keyTrends":
                    basePrompt = "Identify major trends, growth patterns, and unusual activity using provided platform metrics only. Context/Question: " + question;
                    break;
                case "adminRecommendations":
                    basePrompt = "Provide actionable recommendations for improving platform operations based on provided metrics. Context/Question: " + question;
                    break;
                case "resourcePlanning":
                    basePrompt = "Analyze current workload, user activity, and case volume, and suggest staffing, resource allocation, and operational improvements using provided metrics. Context/Question: " + question;
                    break;
                case "riskAttention":
                    basePrompt = "Identify unresolved cases, bottlenecks, risks, outbreak alerts, pending workflows, and items requiring immediate attention. Context/Question: " + question;
                    break;
                case "campaignReview":
                    basePrompt = "Analyze campaign performance, engagement, reach, and improvement opportunities using real campaign metrics. Context/Question: " + question;
                    break;
                default:
                    basePrompt = question;
                    break;
            }
        }
        return metricsHeader + basePrompt;
    }

    @Override
    @Transactional
    public ChatResponse processChat(ChatRequest request) {
        String question = request.getQuestion() != null ? request.getQuestion().trim() : "";
        String topic = request.getTopic();
        String imageBase64 = request.getImageBase64();

        log.info("Processing Chat request for UserId: {}, Topic: '{}', Question: '{}', HasImage: {}",
                 request.getUserId(), topic, question, imageBase64 != null && !imageBase64.isBlank());

        String aiResponseText = null;

        if (!question.isBlank() || (imageBase64 != null && !imageBase64.isBlank())) {
            try {
                if (imageBase64 != null && !imageBase64.isBlank()) {
                    String visionPrompt = question.isBlank() ? "Analyze this attached image for visual features." : question;
                    aiResponseText = ollamaClient.generateVisionResponse(visionPrompt, CHAT_SYSTEM_PROMPT, imageBase64);
                } else if (isAdminTopic(topic)) {
                    AdminAnalyticsContext metricsContext = fetchRealPlatformMetrics();
                    log.info("Admin Metrics Context: {}", metricsContext.toFormattedMetrics());
                    String enrichedPrompt = buildAdminPrompt(topic, question, metricsContext);
                    aiResponseText = ollamaClient.generateCompletion(enrichedPrompt, ADMIN_SYSTEM_PROMPT);
                } else {
                    aiResponseText = ollamaClient.generateCompletion(question, CHAT_SYSTEM_PROMPT);
                }
            } catch (Exception e) {
                log.warn("Gemini AI completion call threw exception: {}", e.getMessage());
            }
        }

        if (aiResponseText == null || aiResponseText.isBlank()) {
            aiResponseText = "AI service unavailable. Please try again later.";
        }

        aiResponseText = enforceMaxWords(aiResponseText, 60);

        Long targetUserId = request.getUserId();
        if (targetUserId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        ChatHistory chatHistory = ChatHistory.builder()
                .userId(targetUserId)
                .question(question)
                .response(aiResponseText)
                .build();

        ChatHistory savedChat = chatHistoryRepository.save(chatHistory);

        return mapToResponse(savedChat);
    }

    private String enforceMaxWords(String text, int maxWords) {
        if (text == null) return "";
        String[] words = text.split("\\s+");
        if (words.length <= maxWords) return text;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < maxWords; i++) {
            sb.append(words[i]).append(" ");
        }
        return sb.toString().trim() + "...";
    }

    private ChatResponse mapToResponse(ChatHistory chatHistory) {
        return ChatResponse.builder()
                .id(chatHistory.getId())
                .userId(chatHistory.getUserId())
                .question(chatHistory.getQuestion())
                .response(chatHistory.getResponse())
                .createdAt(chatHistory.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatResponse> getChatHistoryByUserId(Long userId) {
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return history.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
}
