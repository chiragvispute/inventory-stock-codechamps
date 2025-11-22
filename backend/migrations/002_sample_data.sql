-- Sample data for testing the inventory management system

-- Insert sample users
INSERT INTO users (login_id, email, password, user_role, first_name, last_name) VALUES
('admin', 'admin@stockmaster.com', '$2b$10$dummy_hashed_password', 'admin', 'System', 'Administrator'),
('manager1', 'manager@stockmaster.com', '$2b$10$dummy_hashed_password', 'manager', 'John', 'Smith'),
('operator1', 'operator@stockmaster.com', '$2b$10$dummy_hashed_password', 'operator', 'Jane', 'Doe');

-- Insert sample warehouses
INSERT INTO warehouses (name, short_code, address) VALUES
('Main Warehouse', 'MAIN', '123 Industrial Street, Business District'),
('Secondary Warehouse', 'SEC', '456 Storage Avenue, Logistics Zone'),
('Distribution Center', 'DIST', '789 Distribution Road, Port Area');

-- Insert sample locations
INSERT INTO locations (name, short_code, warehouse_id, description) VALUES
('Receiving Area', 'REC', 1, 'Incoming goods receiving area'),
('Storage Zone A', 'STA', 1, 'General storage area A'),
('Storage Zone B', 'STB', 1, 'General storage area B'),
('Picking Area', 'PICK', 1, 'Order picking and preparation area'),
('Shipping Area', 'SHIP', 1, 'Outbound goods shipping area'),
('Cold Storage', 'COLD', 2, 'Temperature controlled storage'),
('Bulk Storage', 'BULK', 2, 'Large item storage area'),
('Distribution Floor', 'DISTF', 3, 'Main distribution floor');

-- Insert sample product categories
INSERT INTO product_categories (name, description) VALUES
('Electronics', 'Electronic devices and components'),
('Office Supplies', 'General office and administrative supplies'),
('Tools & Equipment', 'Industrial tools and equipment'),
('Raw Materials', 'Manufacturing raw materials'),
('Consumables', 'Consumable items and supplies');

-- Insert sample products
INSERT INTO products (name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock) VALUES
('Laptop Computer', 'LAP-001', 1, 'PC', 1200.00, 50),
('Wireless Mouse', 'MOU-001', 1, 'PC', 25.99, 200),
('Office Chair', 'CHR-001', 2, 'PC', 299.99, 25),
('A4 Paper Pack', 'PAP-001', 2, 'PK', 8.99, 500),
('Power Drill', 'DRI-001', 3, 'PC', 89.99, 15),
('Steel Sheets', 'STL-001', 4, 'SH', 45.50, 100),
('Ink Cartridge', 'INK-001', 5, 'PC', 35.00, 75);

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('TechCorp Solutions', 'Mike Johnson', 'mike@techcorp.com', '+1-555-0101', '100 Tech Park, Silicon Valley'),
('Office Depot Inc', 'Sarah Wilson', 'sarah@officedepot.com', '+1-555-0102', '200 Supply Street, Downtown'),
('Industrial Tools Ltd', 'Bob Martinez', 'bob@industrialtools.com', '+1-555-0103', '300 Tool Avenue, Industrial Park'),
('Steel & Materials Co', 'Lisa Chen', 'lisa@steelmaterials.com', '+1-555-0104', '400 Materials Road, Factory District');

-- Insert sample customers
INSERT INTO customers (name, contact_person, email, phone, address) VALUES
('ABC Corporation', 'Tom Brown', 'tom@abccorp.com', '+1-555-0201', '500 Business Blvd, Corporate Plaza'),
('XYZ Enterprises', 'Emma Davis', 'emma@xyzent.com', '+1-555-0202', '600 Enterprise Way, Business Center'),
('Local School District', 'David Lee', 'david@schooldistrict.edu', '+1-555-0203', '700 Education Street, School Zone'),
('City Government', 'Maria Garcia', 'maria@city.gov', '+1-555-0204', '800 City Hall Plaza, Government District');

-- Insert sample stock levels
INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use, min_stock_level, max_stock_level) VALUES
(1, 2, 30, 25, 10, 100),  -- Laptops in Storage Zone A
(1, 3, 20, 20, 5, 50),    -- Laptops in Storage Zone B
(2, 2, 150, 140, 50, 500), -- Wireless Mouse in Storage Zone A
(3, 2, 15, 12, 5, 30),    -- Office Chairs in Storage Zone A
(4, 4, 400, 350, 100, 1000), -- A4 Paper in Picking Area
(5, 7, 10, 8, 3, 25),     -- Power Drills in Bulk Storage
(6, 7, 80, 75, 20, 200),  -- Steel Sheets in Bulk Storage
(7, 2, 50, 45, 15, 150);  -- Ink Cartridges in Storage Zone A