-- Migration: Ensure user_id column exists in family_members and health_records tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'citizen_id') THEN
        ALTER TABLE family_members RENAME COLUMN citizen_id TO user_id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'user_id') THEN
        ALTER TABLE family_members ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'health_records' AND column_name = 'citizen_id') THEN
        ALTER TABLE health_records RENAME COLUMN citizen_id TO user_id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'health_records' AND column_name = 'user_id') THEN
        ALTER TABLE health_records ADD COLUMN user_id BIGINT NOT NULL DEFAULT 1;
    END IF;
END $$;
