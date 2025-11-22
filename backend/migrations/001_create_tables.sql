-- Create database tables based on ERD
-- Execute this file to create all tables for the inventory management system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    login_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('admin', 'manager', 'operator', 'viewer')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
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
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('purchase', 'return', 'transfer_in')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'validated', 'done', 'cancelled')),
    supplier_id INTEGER REFERENCES suppliers(supplier_id) ON DELETE RESTRICT,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    from_location VARCHAR(200),
    to_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    printed_at TIMESTAMP
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
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('sale', 'return', 'transfer_out')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'validated', 'done', 'cancelled')),
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE RESTRICT,
    responsible_user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    from_location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE RESTRICT,
    to_location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP,
    printed_at TIMESTAMP
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

-- Create indexes for better performance
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

-- Create triggers for updating timestamps
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