-- Migration: Make relationship column nullable in family_members table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'relationship') THEN
        ALTER TABLE family_members ALTER COLUMN relationship DROP NOT NULL;
    END IF;
END $$;
