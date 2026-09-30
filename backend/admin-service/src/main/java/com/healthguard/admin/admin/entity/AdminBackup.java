package com.healthguard.admin.admin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "admin_backups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminBackup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "last_backup_at")
    private ZonedDateTime lastBackupAt;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "formatted_size", length = 50)
    private String formattedSize;

    @Column(name = "next_scheduled_backup")
    private ZonedDateTime nextScheduledBackup;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
