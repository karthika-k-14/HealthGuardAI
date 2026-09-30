-- ==============================================================================
-- FLYWAY MIGRATION V16: PERMANENT FORECAST REFRESH & UNIQUE CONSTRAINTS
-- Truncates old duplicate records and enforces 1 medicine = 1 forecast row
-- ==============================================================================

TRUNCATE TABLE medicine_demand_forecasts RESTART IDENTITY CASCADE;
TRUNCATE TABLE expiry_risk_alerts RESTART IDENTITY CASCADE;
TRUNCATE TABLE demand_anomaly_alerts RESTART IDENTITY CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_forecast_medicine'
    ) THEN
        ALTER TABLE medicine_demand_forecasts
        ADD CONSTRAINT uk_forecast_medicine UNIQUE(medicine_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_med_forecast_med_id ON medicine_demand_forecasts(medicine_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_med_id ON expiry_risk_alerts(medicine_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_med_id ON demand_anomaly_alerts(medicine_id);
