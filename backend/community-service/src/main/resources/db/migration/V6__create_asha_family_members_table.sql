-- PostgreSQL DDL Migration: Create asha_family_members Table to avoid collision with citizen-service family_members table

CREATE TABLE IF NOT EXISTS asha_family_members (
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

CREATE INDEX IF NOT EXISTS idx_asha_family_members_family_id ON asha_family_members(family_id);
