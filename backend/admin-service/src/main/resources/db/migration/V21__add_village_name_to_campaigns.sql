-- V21: Add village_name column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS village_name VARCHAR(255);
