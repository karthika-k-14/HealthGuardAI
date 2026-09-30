-- V11: Create health_officer_settings table
-- Stores real-time configurable settings for Health Officer module: Campaign Management and Broadcast Notifications

CREATE TABLE IF NOT EXISTS health_officer_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    user_email VARCHAR(255),
    default_campaign_duration VARCHAR(50) DEFAULT '14 Days',
    auto_archive_completed_campaigns BOOLEAN DEFAULT TRUE,
    campaign_progress_alerts BOOLEAN DEFAULT TRUE,
    campaign_progress_milestones VARCHAR(100) DEFAULT '25,50,75,100',
    campaign_performance_summary BOOLEAN DEFAULT TRUE,
    enable_broadcast_notifications BOOLEAN DEFAULT TRUE,
    emergency_alerts BOOLEAN DEFAULT TRUE,
    disease_outbreak_alerts BOOLEAN DEFAULT TRUE,
    vaccination_drive_alerts BOOLEAN DEFAULT TRUE,
    campaign_awareness_alerts BOOLEAN DEFAULT TRUE,
    referral_escalation_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_officer_settings_user_id ON health_officer_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_health_officer_settings_email ON health_officer_settings(user_email);
