-- PostgreSQL DDL Migration: Family Management Tables

CREATE TABLE IF NOT EXISTS families (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    asha_worker_id BIGINT NOT NULL,
    house_number VARCHAR(100),
    village VARCHAR(255),
    head_of_family VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    risk_level VARCHAR(50) DEFAULT 'Low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_members (
    id BIGSERIAL PRIMARY KEY,
    family_id BIGINT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(50) NOT NULL,
    is_pregnant BOOLEAN DEFAULT FALSE,
    is_child_member BOOLEAN DEFAULT FALSE,
    vaccination_status VARCHAR(100) DEFAULT 'UP_TO_DATE',
    health_conditions TEXT,
    risk_status VARCHAR(50) DEFAULT 'NORMAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_families_citizen_id
ON families(citizen_id);

CREATE INDEX IF NOT EXISTS idx_families_asha_worker_id
ON families(asha_worker_id);

CREATE INDEX IF NOT EXISTS idx_family_members_family_id
ON family_members(family_id);