-- PostgreSQL DDL Migration: Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    citizen_name VARCHAR(255),
    risk_level VARCHAR(50) DEFAULT 'MEDIUM',
    disease_category VARCHAR(100),
    disease VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



