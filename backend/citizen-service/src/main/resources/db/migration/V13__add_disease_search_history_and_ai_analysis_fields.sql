-- V13: Create disease_search_history table and update ai_analysis table columns

CREATE TABLE IF NOT EXISTS disease_search_history (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    disease_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disease_search_citizen ON disease_search_history(citizen_id);
CREATE INDEX IF NOT EXISTS idx_disease_search_name ON disease_search_history(disease_name);
CREATE INDEX IF NOT EXISTS idx_disease_search_time ON disease_search_history(created_at);

-- Add missing columns to ai_analysis if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='response') THEN
        ALTER TABLE ai_analysis ADD COLUMN response TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='disease_category') THEN
        ALTER TABLE ai_analysis ADD COLUMN disease_category VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='urgency_level') THEN
        ALTER TABLE ai_analysis ADD COLUMN urgency_level VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='risk_score') THEN
        ALTER TABLE ai_analysis ADD COLUMN risk_score DOUBLE PRECISION;
    END IF;
END $$;
