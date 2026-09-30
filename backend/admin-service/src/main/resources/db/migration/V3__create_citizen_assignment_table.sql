-- PostgreSQL Migration: Citizen Assignment Table

CREATE TABLE IF NOT EXISTS citizen_assignment (
    assignment_id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    asha_worker_id BIGINT NOT NULL,
    assigned_by_admin_id BIGINT,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    citizen_name VARCHAR(255),
    asha_worker_name VARCHAR(255),
    village VARCHAR(255),
    CONSTRAINT uk_citizen_assignment UNIQUE (citizen_id)
);

CREATE INDEX IF NOT EXISTS idx_citizen_assignment_asha_id ON citizen_assignment(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_citizen_assignment_status ON citizen_assignment(status);
