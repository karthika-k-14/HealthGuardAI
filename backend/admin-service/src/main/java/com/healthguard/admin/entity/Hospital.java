package com.healthguard.admin.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals", indexes = {
        @Index(name = "idx_hospitals_district", columnList = "district"),
        @Index(name = "idx_hospitals_state", columnList = "state"),
        @Index(name = "idx_hospitals_type", columnList = "hospital_type"),
        @Index(name = "idx_hospitals_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Hospital name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @NotBlank(message = "District is required")
    @Column(name = "district", nullable = false)
    private String district;

    @NotBlank(message = "State is required")
    @Column(name = "state", nullable = false)
    private String state;

    @JsonProperty("phone")
    @Column(name = "contact_number")
    private String contactNumber;

    @NotBlank(message = "Hospital type is required")
    @JsonProperty("type")
    @Column(name = "hospital_type", nullable = false)
    private String hospitalType; // Government, Private, PHC, CHC, District Hospital

    @Min(value = 0, message = "Beds count cannot be negative")
    @Column(name = "beds")
    @Builder.Default
    private Integer beds = 50;


    @Column(name = "status")
    @Builder.Default
    private String status = "Operational"; // Operational, Near Capacity, Critical

    @Column(name = "emergency_services")
    @Builder.Default
    private Boolean emergencyServices = true;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "services", length = 1000)
    private String services; // Emergency, ICU, OPD, Pediatrics, Surgery, Maternity

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getHospitalType() { return hospitalType; }
    public void setHospitalType(String hospitalType) { this.hospitalType = hospitalType; }

    public Integer getBeds() { return beds; }
    public void setBeds(Integer beds) { this.beds = beds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getEmergencyServices() { return emergencyServices; }
    public void setEmergencyServices(Boolean emergencyServices) { this.emergencyServices = emergencyServices; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

