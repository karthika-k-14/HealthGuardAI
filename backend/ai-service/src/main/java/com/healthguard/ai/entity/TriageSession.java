package com.healthguard.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "triage_sessions", indexes = {
        @Index(name = "idx_triage_user", columnList = "user_id"),
        @Index(name = "idx_triage_uuid", columnList = "session_uuid"),
        @Index(name = "idx_triage_stage", columnList = "current_stage"),
        @Index(name = "idx_triage_risk", columnList = "risk_level"),
        @Index(name = "idx_triage_emergency", columnList = "emergency_alert"),
        @Index(name = "idx_triage_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TriageSession {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_uuid", nullable = false, unique = true)
    private String sessionUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false)
    private ConversationStage currentStage;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "follow_up_answers", columnDefinition = "TEXT")
    private String followUpAnswers;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "emergency_alert")
    private Boolean emergencyAlert;

    @Column(name = "language")
    private String language;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getSessionUuid() { return sessionUuid; }
    public void setSessionUuid(String sessionUuid) { this.sessionUuid = sessionUuid; }

    public ConversationStage getCurrentStage() { return currentStage; }
    public void setCurrentStage(ConversationStage currentStage) { this.currentStage = currentStage; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getFollowUpAnswers() { return followUpAnswers; }
    public void setFollowUpAnswers(String followUpAnswers) { this.followUpAnswers = followUpAnswers; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Boolean getEmergencyAlert() { return emergencyAlert; }
    public void setEmergencyAlert(Boolean emergencyAlert) { this.emergencyAlert = emergencyAlert; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
