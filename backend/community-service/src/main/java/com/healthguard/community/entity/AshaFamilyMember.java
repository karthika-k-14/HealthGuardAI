package com.healthguard.community.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asha_family_members", indexes = {
        @Index(name = "idx_asha_family_members_family_id", columnList = "family_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AshaFamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    @JsonIgnore
    private AshaFamily family;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "relationship", nullable = false)
    private String relationship;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "gender", nullable = false)
    private String gender;

    @Builder.Default
    @Column(name = "is_pregnant")
    private Boolean isPregnant = false;

    @Builder.Default
    @Column(name = "is_child_member")
    private Boolean isChildMember = false;

    @Builder.Default
    @Column(name = "vaccination_status")
    private String vaccinationStatus = "UP_TO_DATE";

    @Column(name = "health_conditions", columnDefinition = "TEXT")
    private String healthConditions;

    @Builder.Default
    @Column(name = "risk_status")
    private String riskStatus = "NORMAL";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AshaFamily getFamily() { return family; }
    public void setFamily(AshaFamily family) { this.family = family; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Boolean getIsPregnant() { return isPregnant; }
    public void setIsPregnant(Boolean isPregnant) { this.isPregnant = isPregnant; }

    public Boolean getIsChildMember() { return isChildMember; }
    public void setIsChildMember(Boolean isChildMember) { this.isChildMember = isChildMember; }

    public String getVaccinationStatus() { return vaccinationStatus; }
    public void setVaccinationStatus(String vaccinationStatus) { this.vaccinationStatus = vaccinationStatus; }

    public String getHealthConditions() { return healthConditions; }
    public void setHealthConditions(String healthConditions) { this.healthConditions = healthConditions; }

    public String getRiskStatus() { return riskStatus; }
    public void setRiskStatus(String riskStatus) { this.riskStatus = riskStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getHouseNumber() {
        return family != null ? family.getHouseNumber() : null;
    }

    public String getVillage() {
        return family != null ? family.getVillage() : null;
    }

    public Long getFamilyId() {
        return family != null ? family.getId() : null;
    }
}
