-- Migration: Make family_id nullable with default generator in family_members table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'family_id') THEN
        ALTER TABLE family_members ALTER COLUMN family_id DROP NOT NULL;
    END IF;
END $$;
