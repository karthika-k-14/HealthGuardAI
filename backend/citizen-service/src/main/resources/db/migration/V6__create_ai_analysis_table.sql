CREATE TABLE IF NOT EXISTS ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    citizen_id BIGINT NOT NULL,
    query_text TEXT NOT NULL,
    intent VARCHAR(100),
    disease VARCHAR(200),
    urgency VARCHAR(50),
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_citizen_id ON ai_analysis(citizen_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_urgency ON ai_analysis(urgency);
