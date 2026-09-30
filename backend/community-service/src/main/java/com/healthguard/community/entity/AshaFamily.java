package com.healthguard.community.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "families", indexes = {
        @Index(name = "idx_families_citizen_id", columnList = "citizen_id"),
        @Index(name = "idx_families_asha_worker_id", columnList = "asha_worker_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AshaFamily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "citizen_id", nullable = false)
    private Long citizenId;

    @Column(name = "asha_worker_id", nullable = false)
    private Long ashaWorkerId;

    @Column(name = "house_number")
    private String houseNumber;

    @Column(name = "village")
    private String village;

    @Column(name = "head_of_family", nullable = false)
    private String headOfFamily;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Builder.Default
    @Column(name = "risk_level")
    private String riskLevel = "Low";

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AshaFamilyMember> members = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

    public Long getAshaWorkerId() { return ashaWorkerId; }
    public void setAshaWorkerId(Long ashaWorkerId) { this.ashaWorkerId = ashaWorkerId; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getHeadOfFamily() { return headOfFamily; }
    public void setHeadOfFamily(String headOfFamily) { this.headOfFamily = headOfFamily; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<AshaFamilyMember> getMembers() { return members; }
    public void setMembers(List<AshaFamilyMember> members) { this.members = members; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
