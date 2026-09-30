-- V22: Remove target_audience column from campaigns table (no longer used)
ALTER TABLE campaigns DROP COLUMN IF EXISTS target_audience;
