-- Migration V12: Broadcast Notifications & Campaigns Table
CREATE TABLE IF NOT EXISTS broadcast_notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    notification_type VARCHAR(50) NOT NULL DEFAULT 'info',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_broadcast_created_at ON broadcast_notifications(created_at DESC);

-- Ensure campaigns table exists with all standard columns
CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    description TEXT,
    target_audience VARCHAR(100),
    district VARCHAR(100),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    progress INT DEFAULT 0,
    reach VARCHAR(50) DEFAULT '10,000+',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure created_at has a default if the table was created by JPA without one
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE campaigns ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- No mock campaigns seeded. Campaigns are populated exclusively from live API creation.


