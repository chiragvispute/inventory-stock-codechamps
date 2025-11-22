-- COMPLETE INVENTORY MANAGEMENT DATABASE SETUP
-- Single file with all tables and sample data
-- Execute this file to create the complete database structure with test data

-- ==============================================
-- TABLE CREATION SECTION
-- ==============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    login_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('admin', 'manager', 'operator', 'viewer')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    otp_secret VARCHAR(255),
    reset_otp VARCHAR(6),
    reset_otp_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_code VARCHAR(20) NOT NULL,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, short_code)
);

-- Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku_code VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER NOT NULL REFERENCES product_categories(category_id) ON DELETE RESTRICT,
    unit_of_measure VARCHAR(50) NOT NULL,
    per_unit_cost DECIMAL(12,4) DEFAULT 0.0000,
    initial_stock DECIMAL(12,4) DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Levels table (composite primary key)
CREATE TABLE IF NOT EXISTS stock_levels (
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    quantity_on_hand DECIMAL(12,4) DEFAULT 0.0000,
    quantity_free_to_use DECIMAL(12,4) DEFAULT 0.0000,
    per_unit_cost DECIMAL(12,4) DEFAULT 0.0000,
    min_stock_level DECIMAL(12,4) DEFAULT 0.0000,
    max_stock_level DECIMAL(12,4),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, location_id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
    receipt_id SERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    schedule_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'done', 'cancelled')),
    supplier_id INTEGER REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    to_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Items table
CREATE TABLE IF NOT EXISTS receipt_items (
    receipt_item_id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity_received DECIMAL(12,4) DEFAULT 0.0000,
    quantity_expected DECIMAL(12,4) NOT NULL,
    unit_cost_at_receipt DECIMAL(12,4) DEFAULT 0.0000
);

-- Delivery Orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
    delivery_order_id SERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    schedule_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'done', 'cancelled')),
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE RESTRICT,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    from_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Order Items table
CREATE TABLE IF NOT EXISTS delivery_order_items (
    delivery_order_item_id SERIAL PRIMARY KEY,
    delivery_order_id INTEGER NOT NULL REFERENCES delivery_orders(delivery_order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity_delivered DECIMAL(12,4) DEFAULT 0.0000,
    quantity_ordered DECIMAL(12,4) NOT NULL
);

-- Internal Transfers table
CREATE TABLE IF NOT EXISTS internal_transfers (
    transfer_id SERIAL PRIMARY KEY,
    reference VARCHAR(100) UNIQUE NOT NULL,
    from_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    to_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity DECIMAL(12,4) NOT NULL,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'done', 'cancelled')),
    transfer_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    adjustment_id SERIAL PRIMARY KEY,
    adjustment_date DATE NOT NULL,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    old_quantity DECIMAL(12,4) NOT NULL,
    new_quantity DECIMAL(12,4) NOT NULL,
    difference DECIMAL(12,4) GENERATED ALWAYS AS (new_quantity - old_quantity) STORED,
    reason TEXT NOT NULL,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Move History table (audit trail)
CREATE TABLE IF NOT EXISTS move_history (
    move_id SERIAL PRIMARY KEY,
    transaction_ref VARCHAR(100) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('receipt', 'delivery', 'transfer', 'adjustment')),
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    from_location_id INTEGER REFERENCES locations(location_id) ON DELETE RESTRICT,
    to_location_id INTEGER REFERENCES locations(location_id) ON DELETE RESTRICT,
    quantity_change DECIMAL(12,4) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL,
    move_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    description TEXT
);

-- Dashboard Tables
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_widgets (
    widget_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES SECTION
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_sku_code ON products(sku_code);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_location ON stock_levels(location_id);
CREATE INDEX IF NOT EXISTS idx_receipts_reference ON receipts(reference);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_reference ON delivery_orders(reference);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_reference ON internal_transfers(reference);
CREATE INDEX IF NOT EXISTS idx_move_history_product ON move_history(product_id);
CREATE INDEX IF NOT EXISTS idx_move_history_transaction_ref ON move_history(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_move_history_timestamp ON move_history(move_timestamp);

-- ==============================================
-- TRIGGERS SECTION
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internal_transfers_updated_at BEFORE UPDATE ON internal_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update stock_levels last_updated_at
CREATE OR REPLACE FUNCTION update_stock_level_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_levels_timestamp BEFORE UPDATE ON stock_levels
    FOR EACH ROW EXECUTE FUNCTION update_stock_level_timestamp();

-- ==============================================
-- SAMPLE DATA SECTION
-- ==============================================

-- Insert sample users
INSERT INTO users (login_id, email, password, user_role, first_name, last_name, status) VALUES 
('admin', 'admin@company.com', '$2b$10$rZdR8UgFl7hJ5FJzT5LJ/eoZQZLJOWfB8z8zGvPvN8fN8zPfN8z/', 'admin', 'John', 'Admin', 'active'),
('manager1', 'manager@company.com', '$2b$10$rZdR8UgFl7hJ5FJzT5LJ/eoZQZLJOWfB8z8zGvPvN8fN8zPfN8z/', 'manager', 'Jane', 'Manager', 'active'),
('operator1', 'operator@company.com', '$2b$10$rZdR8UgFl7hJ5FJzT5LJ/eoZQZLJOWfB8z8zGvPvN8fN8zPfN8z/', 'operator', 'Mike', 'Operator', 'active'),
('viewer1', 'viewer@company.com', '$2b$10$rZdR8UgFl7hJ5FJzT5LJ/eoZQZLJOWfB8z8zGvPvN8fN8zPfN8z/', 'viewer', 'Sarah', 'Viewer', 'active')
ON CONFLICT (login_id) DO NOTHING;

-- Insert sample warehouses
INSERT INTO warehouses (name, short_code, address) VALUES 
('Main Warehouse', 'WH001', '123 Industrial Blvd, City, State 12345'),
('Secondary Storage', 'WH002', '456 Storage Ave, City, State 12346'),
('Distribution Center', 'WH003', '789 Logistics Way, City, State 12347')
ON CONFLICT (name) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, short_code, warehouse_id, description) VALUES 
('Receiving Area', 'RCV', 1, 'Area for receiving incoming goods'),
('Storage Zone A', 'STA', 1, 'Primary storage area for electronics'),
('Storage Zone B', 'STB', 1, 'Secondary storage area for furniture'),
('Picking Area', 'PCK', 1, 'Area for order picking and preparation'),
('Bulk Storage', 'BLK', 2, 'Large item storage'),
('North Receiving', 'NRC', 2, 'North side receiving dock'),
('Quick Pick Zone', 'QPZ', 3, 'Fast-moving items storage'),
('Overflow Storage', 'OVF', 3, 'Additional storage capacity')
ON CONFLICT (warehouse_id, short_code) DO NOTHING;

-- Insert sample product categories
INSERT INTO product_categories (name, description) VALUES 
('Electronics', 'Electronic devices and components'),
('Furniture', 'Office and home furniture'),
('Supplies', 'General office and industrial supplies'),
('Tools', 'Hand tools and equipment'),
('Safety Equipment', 'Personal protective equipment and safety gear')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock) VALUES 
('Laptop Computer', 'LAP-001', 1, 'Each', 799.99, 25),
('Wireless Mouse', 'MSE-002', 1, 'Each', 29.99, 100),
('Office Desk', 'DSK-001', 2, 'Each', 299.99, 15),
('Office Chair', 'CHR-001', 2, 'Each', 199.99, 30),
('Printer Paper', 'PPR-001', 3, 'Pack', 24.99, 200),
('Blue Pens', 'PEN-001', 3, 'Box', 12.99, 150),
('Screwdriver Set', 'SCR-001', 4, 'Set', 39.99, 50),
('Safety Helmet', 'HLM-001', 5, 'Each', 45.99, 75),
('Monitor 24inch', 'MON-001', 1, 'Each', 199.99, 40),
('Keyboard', 'KEY-001', 1, 'Each', 49.99, 80)
ON CONFLICT (sku_code) DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES 
('TechCorp Solutions', 'Alice Johnson', 'alice@techcorp.com', '+1-555-0101', '100 Tech Street, Silicon Valley, CA 94000'),
('Furniture Plus', 'Bob Smith', 'bob@furnitureplus.com', '+1-555-0102', '200 Furniture Ave, Grand Rapids, MI 49503'),
('Office Supplies Inc', 'Carol Davis', 'carol@officesupplies.com', '+1-555-0103', '300 Supply Road, Chicago, IL 60601'),
('Industrial Tools Ltd', 'David Wilson', 'david@industrialtools.com', '+1-555-0104', '400 Tool Lane, Detroit, MI 48201'),
('Safety First Co', 'Eva Brown', 'eva@safetyfirst.com', '+1-555-0105', '500 Safety Blvd, Houston, TX 77001')
ON CONFLICT (name) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (name, contact_person, email, phone, address) VALUES 
('ABC Corporation', 'Frank Miller', 'frank@abccorp.com', '+1-555-0201', '600 Business Pkwy, New York, NY 10001'),
('XYZ Enterprise', 'Grace Lee', 'grace@xyzent.com', '+1-555-0202', '700 Enterprise Dr, Los Angeles, CA 90001'),
('Global Industries', 'Henry Taylor', 'henry@globalind.com', '+1-555-0203', '800 Global Way, Miami, FL 33101'),
('Metro Solutions', 'Ivy Chen', 'ivy@metrosol.com', '+1-555-0204', '900 Metro St, Seattle, WA 98101'),
('Prime Manufacturing', 'Jack Roberts', 'jack@primemfg.com', '+1-555-0205', '1000 Prime Ave, Portland, OR 97201')
ON CONFLICT DO NOTHING;

-- Insert sample stock levels
INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use, per_unit_cost, min_stock_level, max_stock_level) VALUES 
(1, 2, 25.0000, 20.0000, 799.99, 10.0000, 50.0000),
(2, 2, 100.0000, 95.0000, 29.99, 25.0000, 200.0000),
(3, 3, 15.0000, 12.0000, 299.99, 5.0000, 30.0000),
(4, 3, 30.0000, 28.0000, 199.99, 10.0000, 50.0000),
(5, 2, 200.0000, 190.0000, 24.99, 50.0000, 500.0000),
(6, 2, 150.0000, 140.0000, 12.99, 30.0000, 300.0000),
(7, 4, 50.0000, 45.0000, 39.99, 15.0000, 100.0000),
(8, 4, 75.0000, 70.0000, 45.99, 20.0000, 150.0000),
(9, 2, 40.0000, 35.0000, 199.99, 15.0000, 80.0000),
(10, 2, 80.0000, 75.0000, 49.99, 20.0000, 160.0000)
ON CONFLICT (product_id, location_id) DO NOTHING;

-- Insert sample receipts
INSERT INTO receipts (reference, schedule_date, status, supplier_id, responsible_user_id, to_location_id) VALUES 
('REC-2024-001', '2024-11-15', 'done', 1, 1, 1),
('REC-2024-002', '2024-11-18', 'confirmed', 2, 2, 1),
('REC-2024-003', '2024-11-20', 'draft', 3, 1, 1),
('REC-2024-004', '2024-11-22', 'confirmed', 1, 2, 1),
('REC-2024-005', '2024-11-25', 'draft', 4, 1, 1),
('REC-2024-006', '2024-11-28', 'done', 5, 2, 1)
ON CONFLICT (reference) DO NOTHING;

-- Insert sample delivery orders
INSERT INTO delivery_orders (reference, schedule_date, status, customer_id, responsible_user_id, from_location_id) VALUES 
('DEL-2024-001', '2024-11-16', 'done', 1, 1, 4),
('DEL-2024-002', '2024-11-19', 'confirmed', 2, 2, 4),
('DEL-2024-003', '2024-11-21', 'draft', 3, 1, 4),
('DEL-2024-004', '2024-11-23', 'confirmed', 4, 2, 4),
('DEL-2024-005', '2024-11-26', 'draft', 5, 1, 4),
('DEL-2024-006', '2024-11-29', 'done', 1, 2, 4)
ON CONFLICT (reference) DO NOTHING;

-- Insert sample move history
INSERT INTO move_history (transaction_ref, transaction_type, product_id, from_location_id, to_location_id, quantity_change, unit_of_measure, responsible_user_id, description) VALUES 
('REC-2024-001', 'receipt', 1, NULL, 2, 10.0000, 'Each', 1, 'Received laptops from TechCorp Solutions'),
('REC-2024-001', 'receipt', 2, NULL, 2, 50.0000, 'Each', 1, 'Received wireless mice from TechCorp Solutions'),
('DEL-2024-001', 'delivery', 1, 2, NULL, -5.0000, 'Each', 1, 'Delivered laptops to ABC Corporation'),
('DEL-2024-001', 'delivery', 2, 2, NULL, -20.0000, 'Each', 1, 'Delivered mice to ABC Corporation'),
('TRF-001', 'transfer', 3, 3, 5, 5.0000, 'Each', 2, 'Transferred desks to bulk storage'),
('ADJ-001', 'adjustment', 5, 2, 2, 10.0000, 'Pack', 1, 'Stock adjustment - found additional paper'),
('REC-2024-002', 'receipt', 9, NULL, 2, 20.0000, 'Each', 2, 'Received monitors from TechCorp Solutions'),
('DEL-2024-002', 'delivery', 9, 2, NULL, -5.0000, 'Each', 2, 'Delivered monitors to XYZ Enterprise')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES 
(1, 'Low Stock Alert', 'Office Desk (DSK-001) is running low. Current stock: 15 units', 'warning', false),
(1, 'Receipt Confirmed', 'Receipt REC-2024-004 has been confirmed', 'success', false),
(2, 'Delivery Scheduled', 'Delivery DEL-2024-005 is scheduled for tomorrow', 'info', true),
(2, 'System Update', 'Inventory system will be updated tonight', 'info', true),
(1, 'Critical Stock', 'Safety Helmet (HLM-001) stock is critical', 'error', false)
ON CONFLICT DO NOTHING;

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES 
('company_name', 'StockShelf Inventory', 'Company name for reports', 1),
('low_stock_threshold', '10', 'Default low stock threshold percentage', 1),
('auto_reorder_enabled', 'true', 'Enable automatic reorder notifications', 1),
('currency_symbol', '$', 'Currency symbol for pricing', 1),
('timezone', 'UTC', 'System timezone setting', 1)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample dashboard widgets
INSERT INTO dashboard_widgets (user_id, widget_type, position_x, position_y, width, height, is_visible) VALUES 
(1, 'stock_summary', 0, 0, 2, 1, true),
(1, 'recent_receipts', 2, 0, 2, 1, true),
(1, 'pending_deliveries', 0, 1, 2, 1, true),
(1, 'low_stock_alerts', 2, 1, 2, 1, true),
(2, 'stock_summary', 0, 0, 2, 1, true),
(2, 'recent_movements', 2, 0, 2, 1, true)
ON CONFLICT DO NOTHING;