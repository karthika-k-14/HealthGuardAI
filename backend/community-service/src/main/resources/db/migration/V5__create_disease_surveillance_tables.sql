-- PostgreSQL Migration: Production-Ready Disease Surveillance & Outbreak Tables

CREATE TABLE IF NOT EXISTS disease_surveillance_reports (
    report_id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    family_id BIGINT,
    asha_worker_id BIGINT NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    village VARCHAR(255) NOT NULL,
    address TEXT,
    phone_number VARCHAR(50),
    report_date DATE NOT NULL,
    report_time VARCHAR(20) NOT NULL,
    disease VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    symptoms TEXT,
    temperature_c DECIMAL(5,2),
    pulse_rate INT,
    blood_pressure VARCHAR(50),
    spo2_percent INT,
    observations TEXT,
    photo_base64 TEXT,
    attachment_name VARCHAR(255),
    emergency_referral BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Pending Review',
    health_officer_notes TEXT,
    created_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP WITH TIME ZONE,
    resolution_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS outbreak_alerts (
    alert_id BIGSERIAL PRIMARY KEY,
    disease VARCHAR(100) NOT NULL,
    village VARCHAR(255) NOT NULL,
    case_count INT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    message TEXT,
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_surveillance_village ON disease_surveillance_reports(village);
CREATE INDEX IF NOT EXISTS idx_surveillance_disease ON disease_surveillance_reports(disease);
CREATE INDEX IF NOT EXISTS idx_surveillance_status ON disease_surveillance_reports(status);
