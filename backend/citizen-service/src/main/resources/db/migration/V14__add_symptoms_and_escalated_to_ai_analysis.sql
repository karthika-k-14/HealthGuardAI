-- V14: Add symptoms and escalated columns to ai_analysis table

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='symptoms') THEN
        ALTER TABLE ai_analysis ADD COLUMN symptoms TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='escalated') THEN
        ALTER TABLE ai_analysis ADD COLUMN escalated BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ai_analysis' AND column_name='confidence_score') THEN
        ALTER TABLE ai_analysis ADD COLUMN confidence_score DOUBLE PRECISION;
    END IF;
END $$;
