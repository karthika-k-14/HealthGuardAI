ALTER TABLE pharmacist_settings 
    ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'dark',
    ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'ENGLISH';

UPDATE pharmacist_settings
SET theme = COALESCE(theme, 'dark'),
    language = COALESCE(language, 'ENGLISH');
