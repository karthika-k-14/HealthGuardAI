-- ==============================================================================
-- FLYWAY MIGRATION V14: MEDICINE ORDERS MANAGEMENT TABLES
-- Embedded supplier details directly in orders (no separate suppliers table)
-- ==============================================================================

-- 1. Medicine Orders Table
CREATE TABLE IF NOT EXISTS medicine_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(50),
    supplier_email VARCHAR(255),
    supplier_address TEXT,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'DRAFT',
    total_items INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    remarks TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON medicine_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON medicine_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_number ON medicine_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON medicine_orders(supplier_name);

-- 2. Medicine Order Items Table
CREATE TABLE IF NOT EXISTS medicine_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    medicine_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    current_stock INTEGER DEFAULT 0,
    predicted_demand INTEGER DEFAULT 0,
    recommended_order INTEGER DEFAULT 0,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES medicine_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON medicine_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_med ON medicine_order_items(medicine_id);

-- 3. Order Status History Table (Audit Timeline)
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    remarks TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_status_history_order FOREIGN KEY (order_id) REFERENCES medicine_orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);
