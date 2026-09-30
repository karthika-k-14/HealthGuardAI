-- Migration V14: Create health_officer_preferences table
CREATE TABLE IF NOT EXISTS health_officer_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    disease_surveillance_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    high_risk_case_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    referral_escalation_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    outbreak_detection_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    campaign_update_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ho_preferences_user_id ON health_officer_preferences(user_id);
