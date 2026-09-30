-- Migration: Add pharmacist profile fields
ALTER TABLE pharmacists 
    ADD COLUMN IF NOT EXISTS license_issued_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
    ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address TEXT;
