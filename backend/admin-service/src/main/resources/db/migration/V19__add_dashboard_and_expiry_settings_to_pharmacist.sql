ALTER TABLE pharmacist_settings 
    ADD COLUMN IF NOT EXISTS auto_refresh_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS expiry_warning_threshold INTEGER DEFAULT 60;

UPDATE pharmacist_settings
SET auto_refresh_enabled = COALESCE(auto_refresh_enabled, TRUE),
    expiry_warning_threshold = COALESCE(expiry_warning_threshold, 60);
