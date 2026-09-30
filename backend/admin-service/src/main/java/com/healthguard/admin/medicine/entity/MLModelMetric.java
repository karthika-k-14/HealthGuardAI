package com.healthguard.admin.medicine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ml_model_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MLModelMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "model_version", nullable = false)
    private String modelVersion;

    @Column(name = "champion_model_name")
    private String championModelName;

    @Column(name = "champion_model_version")
    private String championModelVersion;

    @Column(name = "mae", nullable = false)
    private Double mae;

    @Column(name = "rmse", nullable = false)
    private Double rmse;

    @Column(name = "mape", nullable = false)
    private Double mape;

    @Column(name = "r2_score", nullable = false)
    private Double r2Score;

    @Column(name = "is_champion")
    @Builder.Default
    private Boolean isChampion = false;

    @Column(name = "training_samples", nullable = false)
    private Integer trainingSamples;

    @Column(name = "date_range_days", nullable = false)
    private Integer dateRangeDays;

    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "trained_at", updatable = false)
    private LocalDateTime trainedAt;
}
