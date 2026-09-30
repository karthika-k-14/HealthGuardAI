package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "outbreak_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutbreakAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @Column(name = "disease", nullable = false)
    private String disease;

    @Column(name = "village", nullable = false)
    private String village;

    @Column(name = "case_count", nullable = false)
    private Integer caseCount;

    @Builder.Default
    @Column(name = "status")
    private String status = "ACTIVE";

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @CreationTimestamp
    @Column(name = "alert_date", nullable = false, updatable = false)
    private LocalDateTime alertDate;
}
