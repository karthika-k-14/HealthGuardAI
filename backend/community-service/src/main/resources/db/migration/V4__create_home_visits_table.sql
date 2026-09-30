-- PostgreSQL DDL Migration: Home Visits Table

CREATE TABLE IF NOT EXISTS home_visits (
    visit_id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    family_id BIGINT,
    asha_worker_id BIGINT NOT NULL,
    citizen_name VARCHAR(255),
    visit_type VARCHAR(100) NOT NULL,
    visit_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled',
    observations TEXT,
    recommendations TEXT,
    risk_level VARCHAR(50) DEFAULT 'Low',
    next_visit_date DATE,
    blood_pressure VARCHAR(50),
    weight_kg DECIMAL(5,2),
    temperature_f DECIMAL(5,2),
    symptoms TEXT,
    pregnancy_status VARCHAR(100),
    vaccination_status VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_home_visits_asha_id ON home_visits(asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_citizen_id ON home_visits(citizen_id);
CREATE INDEX IF NOT EXISTS idx_home_visits_status ON home_visits(status);
