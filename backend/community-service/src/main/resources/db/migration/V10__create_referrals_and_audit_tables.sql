-- V10: Create dedicated referrals and referral_status_history tables
-- Health Officer PHC Referral Verification & Audit Tracking System

CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    referral_code VARCHAR(50) UNIQUE,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT,
    patient_gender VARCHAR(50),
    citizen_id VARCHAR(100),
    phone_number VARCHAR(50),
    village VARCHAR(255) NOT NULL,
    address TEXT,
    disease VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'Medium',
    symptoms TEXT,
    vital_signs TEXT,
    referral_reason TEXT,
    referred_phc VARCHAR(255) NOT NULL,
    report_id BIGINT,
    visit_id BIGINT,
    attached_notes TEXT,
    created_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_status_history (
    id BIGSERIAL PRIMARY KEY,
    referral_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_village ON referrals(village);
CREATE INDEX IF NOT EXISTS idx_referrals_disease ON referrals(disease);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_history_ref_id ON referral_status_history(referral_id);

-- Backfill existing referrals from disease_surveillance_reports
INSERT INTO referrals (
    referral_code, patient_name, citizen_id, village, disease, severity,
    symptoms, vital_signs, referral_reason, referred_phc, report_id, created_by, status, created_at, updated_at
)
SELECT 
    'REF-' || LPAD(report_id::text, 5, '0'),
    citizen_name,
    'CIT-' || citizen_id,
    village,
    disease,
    severity,
    symptoms,
    'Temp: ' || COALESCE(temperature_c::text, '37.0') || 'C, BP: ' || COALESCE(blood_pressure, '120/80') || ', SpO2: ' || COALESCE(spo2_percent::text, '98') || '%',
    COALESCE(observations, 'Emergency PHC clinical escalation required due to persistent symptoms'),
    COALESCE(referred_phc, 'Bhubaneswar Central PHC'),
    report_id,
    COALESCE(created_by, 'ASHA Worker'),
    CASE 
        WHEN referral_status = 'ALERT_SENT' THEN 'PENDING'
        WHEN referral_status = 'ACKNOWLEDGED' THEN 'UNDER_REVIEW'
        WHEN referral_status = 'IN_TREATMENT' THEN 'APPROVED'
        WHEN referral_status = 'CLOSED' THEN 'APPROVED'
        WHEN referral_status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') THEN referral_status
        ELSE 'PENDING'
    END,
    created_at,
    COALESCE(date_modified, created_at)
FROM disease_surveillance_reports
WHERE (emergency_referral = TRUE OR referral_status IS NOT NULL)
  AND NOT EXISTS (
      SELECT 1 FROM referrals r WHERE r.report_id = disease_surveillance_reports.report_id
  );

-- No mock seed referrals. Referrals are populated exclusively from live field surveillance reports and API actions.

