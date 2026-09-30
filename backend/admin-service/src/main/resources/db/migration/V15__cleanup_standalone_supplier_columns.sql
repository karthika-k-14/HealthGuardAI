-- ==============================================================================
-- FLYWAY MIGRATION V15: CLEANUP STANDALONE SUPPLIERS ARTIFACTS & CASCADE NULL ON DELETE
-- Drops obsolete supplier_id column from medicine_orders and obsolete suppliers table
-- Sets ON DELETE SET NULL on medicine_order_items fk_order_items_medicine
-- ==============================================================================

ALTER TABLE IF EXISTS medicine_orders DROP COLUMN IF EXISTS supplier_id CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

ALTER TABLE IF EXISTS medicine_order_items ALTER COLUMN medicine_id DROP NOT NULL;
ALTER TABLE IF EXISTS medicine_order_items DROP CONSTRAINT IF EXISTS fk_order_items_medicine;
ALTER TABLE IF EXISTS medicine_order_items ADD CONSTRAINT fk_order_items_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL;
