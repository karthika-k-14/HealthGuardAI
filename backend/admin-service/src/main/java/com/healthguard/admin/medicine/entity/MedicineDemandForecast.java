package com.healthguard.admin.medicine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_demand_forecasts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineDemandForecast {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "medicine_id")
    private Long medicineId;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock;

    @Column(name = "predicted_demand", nullable = false)
    private Integer predictedDemand;

    @Column(name = "confidence", nullable = false)
    private Double confidence;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "recommended_order")
    private Integer recommendedOrder;

    @Column(name = "estimated_days_of_stock_remaining")
    private Integer estimatedDaysOfStockRemaining;

    @Column(name = "insights", columnDefinition = "TEXT")
    private String insights;

    @Column(name = "top_factors_json", columnDefinition = "TEXT")
    private String topFactorsJson;

    @Column(name = "model_version")
    private String modelVersion;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;
}
