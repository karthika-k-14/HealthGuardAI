package com.healthguard.admin.medicine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "outbreak_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutbreakPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disease", nullable = false)
    private String disease;

    @Column(name = "village", nullable = false)
    private String village;

    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "cases_predicted", nullable = false)
    private Integer casesPredicted;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "prediction_date")
    private LocalDate predictionDate;
}
