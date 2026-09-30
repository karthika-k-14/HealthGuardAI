-- PostgreSQL DDL Migration: Add other_disease_name and other_symptoms columns to disease_surveillance_reports

ALTER TABLE disease_surveillance_reports 
ADD COLUMN IF NOT EXISTS other_disease_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS other_symptoms TEXT;
