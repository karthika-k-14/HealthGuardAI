-- PostgreSQL DDL Migration: Add affected person details to disease_surveillance_reports

ALTER TABLE disease_surveillance_reports
ADD COLUMN IF NOT EXISTS affected_person_id BIGINT,
ADD COLUMN IF NOT EXISTS affected_person_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
