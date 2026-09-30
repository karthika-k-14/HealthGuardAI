CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    read_perm BOOLEAN DEFAULT true,
    write_perm BOOLEAN DEFAULT true,
    update_perm BOOLEAN DEFAULT true,
    delete_perm BOOLEAN DEFAULT false,
    dashboard_access BOOLEAN DEFAULT true,
    report_access BOOLEAN DEFAULT true
);

INSERT INTO roles (id, role, label, read_perm, write_perm, update_perm, delete_perm, dashboard_access, report_access)
VALUES 
('ROLE_ASHA', 'asha', 'ASHA Worker', true, true, false, false, true, false),
('ROLE_OFFICER', 'officer', 'Health Officer', true, true, true, false, true, true),
('ROLE_PHARMACIST', 'pharmacist', 'Pharmacist', true, true, true, false, true, true)
ON CONFLICT (id) DO NOTHING;
