package com.healthguard.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "label", nullable = false)
    private String label;

    @Builder.Default
    @Column(name = "read_perm")
    private Boolean readPerm = true;

    @Builder.Default
    @Column(name = "write_perm")
    private Boolean writePerm = true;

    @Builder.Default
    @Column(name = "update_perm")
    private Boolean updatePerm = true;

    @Builder.Default
    @Column(name = "delete_perm")
    private Boolean deletePerm = false;

    @Builder.Default
    @Column(name = "dashboard_access")
    private Boolean dashboardAccess = true;

    @Builder.Default
    @Column(name = "report_access")
    private Boolean reportAccess = true;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Boolean getReadPerm() { return readPerm; }
    public void setReadPerm(Boolean readPerm) { this.readPerm = readPerm; }

    public Boolean getWritePerm() { return writePerm; }
    public void setWritePerm(Boolean writePerm) { this.writePerm = writePerm; }

    public Boolean getUpdatePerm() { return updatePerm; }
    public void setUpdatePerm(Boolean updatePerm) { this.updatePerm = updatePerm; }

    public Boolean getDeletePerm() { return deletePerm; }
    public void setDeletePerm(Boolean deletePerm) { this.deletePerm = deletePerm; }

    public Boolean getDashboardAccess() { return dashboardAccess; }
    public void setDashboardAccess(Boolean dashboardAccess) { this.dashboardAccess = dashboardAccess; }

    public Boolean getReportAccess() { return reportAccess; }
    public void setReportAccess(Boolean reportAccess) { this.reportAccess = reportAccess; }
}
