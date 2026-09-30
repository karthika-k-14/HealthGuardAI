-- ==============================================================================
-- FLYWAY MIGRATION V9: ENTERPRISE AI/ML MEDICINE DEMAND FORECASTING TABLES (COMMUNITY)
-- ==============================================================================

-- 1. Ensure columns exist on medicines table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medicines' AND column_name = 'medicine_name') THEN
        ALTER TABLE medicines ADD COLUMN medicine_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medicines' AND column_name = 'status') THEN
        ALTER TABLE medicines ADD COLUMN status VARCHAR(50) DEFAULT 'AVAILABLE';
    END IF;
END $$;

-- 2. Medicine Usage History Table (Training Data Foundation)
CREATE TABLE IF NOT EXISTS medicine_usage_history (
    usage_id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT,
    medicine_name VARCHAR(255) NOT NULL,
    quantity_used INTEGER NOT NULL,
    disease VARCHAR(255) NOT NULL,
    village VARCHAR(255) NOT NULL,
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_med_usage_date ON medicine_usage_history(usage_date);
CREATE INDEX IF NOT EXISTS idx_med_usage_med ON medicine_usage_history(medicine_name);
CREATE INDEX IF NOT EXISTS idx_med_usage_village ON medicine_usage_history(village);
CREATE INDEX IF NOT EXISTS idx_med_usage_disease ON medicine_usage_history(disease);

-- 3. Machine Learning Model Evaluation & Metrics Table
CREATE TABLE IF NOT EXISTS ml_model_metrics (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    champion_model_name VARCHAR(100),
    champion_model_version VARCHAR(50),
    mae DOUBLE PRECISION NOT NULL,
    rmse DOUBLE PRECISION NOT NULL,
    mape DOUBLE PRECISION NOT NULL,
    r2_score DOUBLE PRECISION NOT NULL,
    is_champion BOOLEAN DEFAULT FALSE,
    training_samples INTEGER NOT NULL,
    date_range_days INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    trained_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Isolation Forest Demand Anomaly Alerts Table
CREATE TABLE IF NOT EXISTS demand_anomaly_alerts (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT,
    medicine_name VARCHAR(255) NOT NULL,
    anomaly_score DOUBLE PRECISION NOT NULL,
    severity VARCHAR(50) DEFAULT 'HIGH',
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Outbreak Predictions Table
CREATE TABLE IF NOT EXISTS outbreak_predictions (
    id BIGSERIAL PRIMARY KEY,
    disease VARCHAR(100) NOT NULL,
    village VARCHAR(255) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    cases_predicted INTEGER NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    prediction_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_outbreak_pred_village ON outbreak_predictions(village);
CREATE INDEX IF NOT EXISTS idx_outbreak_pred_disease ON outbreak_predictions(disease);

-- 6. Medicine Demand Forecasts Table (ML-Driven Forecasts)
CREATE TABLE IF NOT EXISTS medicine_demand_forecasts (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT,
    medicine_name VARCHAR(255) NOT NULL,
    current_stock INTEGER NOT NULL,
    predicted_demand INTEGER NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    recommended_order INTEGER DEFAULT 0,
    estimated_days_of_stock_remaining INTEGER DEFAULT 0,
    insights TEXT,
    top_factors_json TEXT,
    model_version VARCHAR(50),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_med_forecast_med ON medicine_demand_forecasts(medicine_name);

-- 7. Expiry Risk Alerts Table
CREATE TABLE IF NOT EXISTS expiry_risk_alerts (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    days_remaining INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    alert_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expiry_alerts_risk ON expiry_risk_alerts(risk_level);
