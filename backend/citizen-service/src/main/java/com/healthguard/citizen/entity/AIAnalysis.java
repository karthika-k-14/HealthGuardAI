package com.healthguard.citizen.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis", indexes = {
    @Index(name = "idx_ai_analysis_citizen_id", columnList = "citizen_id"),
    @Index(name = "idx_ai_analysis_urgency", columnList = "urgency"),
    @Index(name = "idx_ai_analysis_urgency_lvl", columnList = "urgency_level"),
    @Index(name = "idx_ai_analysis_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "citizen_id", nullable = false)
    private Long citizenId;

    @Column(name = "query_text", nullable = false, columnDefinition = "TEXT")
    private String queryText;

    @Column(name = "response", columnDefinition = "TEXT")
    private String response;

    @Column(name = "intent", length = 100)
    private String intent;

    @Column(name = "disease", length = 200)
    private String disease;

    @Column(name = "disease_category", length = 100)
    private String diseaseCategory;

    @Column(name = "urgency", length = 50)
    private String urgency;

    @Column(name = "urgency_level", length = 50)
    private String urgencyLevel;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "escalated")
    private Boolean escalated;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.diseaseCategory == null && this.disease != null) {
            this.diseaseCategory = this.disease;
        }
        if (this.disease == null && this.diseaseCategory != null) {
            this.disease = this.diseaseCategory;
        }
        if (this.urgencyLevel == null && this.urgency != null) {
            this.urgencyLevel = this.urgency;
        }
        if (this.urgency == null && this.urgencyLevel != null) {
            this.urgency = this.urgencyLevel;
        }
        if (this.riskScore == null && this.confidence != null) {
            this.riskScore = this.confidence > 1.0 ? this.confidence : this.confidence * 100.0;
        }
        if (this.riskScore != null) {
            this.riskScore = Math.min(100.0, Math.max(0.0, this.riskScore));
        }
        if (this.confidence == null && this.riskScore != null) {
            this.confidence = this.riskScore <= 1.0 ? this.riskScore : this.riskScore / 100.0;
        }
        if (this.confidenceScore == null && this.confidence != null) {
            this.confidenceScore = this.confidence;
        }
        if (this.confidence == null && this.confidenceScore != null) {
            this.confidence = this.confidenceScore;
        }
        if (this.escalated == null) {
            this.escalated = false;
        }
    }
}
