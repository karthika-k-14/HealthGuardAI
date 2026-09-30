-- Migration: Create pharmacist_settings table and notifications_enabled column
CREATE TABLE IF NOT EXISTS pharmacist_settings (
    id BIGSERIAL PRIMARY KEY,
    pharmacist_id VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pharmacist_settings 
    ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
