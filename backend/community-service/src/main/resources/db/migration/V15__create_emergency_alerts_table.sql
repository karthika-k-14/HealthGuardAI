-- Flyway Migration: Emergency Alerts and Alert Timeline Tables
-- Version: V15

CREATE TABLE IF NOT EXISTS emergency_alerts (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT,
    citizen_name VARCHAR(255),
    assigned_asha_worker_id BIGINT,
    assigned_asha_worker_name VARCHAR(255),
    symptoms TEXT,
    disease_category VARCHAR(255),
    urgency_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
    urgency_score DOUBLE PRECISION DEFAULT 0.0,
    village VARCHAR(255),
    district VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_citizen_id ON emergency_alerts(citizen_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_asha_id ON emergency_alerts(assigned_asha_worker_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_urgency ON emergency_alerts(urgency_level);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at);

CREATE TABLE IF NOT EXISTS emergency_alert_timeline (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255),
    performed_role VARCHAR(100),
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_alert_timeline_alert_id ON emergency_alert_timeline(alert_id);
