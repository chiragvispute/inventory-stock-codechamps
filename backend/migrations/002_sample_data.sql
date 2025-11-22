-- Sample data for testing the inventory management system

-- Insert sample users (with status field)
INSERT INTO users (login_id, email, password, user_role, first_name, last_name, status) VALUES
('admin', 'admin@stockmaster.com', '$2b$10$dummy_hashed_password', 'admin', 'System', 'Administrator', 'active'),
('manager1', 'manager@stockmaster.com', '$2b$10$dummy_hashed_password', 'manager', 'John', 'Smith', 'active'),
('operator1', 'operator@stockmaster.com', '$2b$10$dummy_hashed_password', 'operator', 'Jane', 'Doe', 'active'),
('viewer1', 'viewer@stockmaster.com', '$2b$10$dummy_hashed_password', 'viewer', 'Mike', 'Johnson', 'active'),
('inactive1', 'inactive@stockmaster.com', '$2b$10$dummy_hashed_password', 'operator', 'Inactive', 'User', 'inactive');

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

-- Insert sample stock levels (with per_unit_cost for location-specific pricing)
INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use, per_unit_cost, min_stock_level, max_stock_level) VALUES
(1, 2, 30, 25, 1200.00, 10, 100),  -- Laptops in Storage Zone A
(1, 3, 20, 20, 1180.00, 5, 50),    -- Laptops in Storage Zone B (slightly different cost)
(2, 2, 150, 140, 25.99, 50, 500), -- Wireless Mouse in Storage Zone A
(3, 2, 15, 12, 299.99, 5, 30),    -- Office Chairs in Storage Zone A
(4, 4, 400, 350, 8.99, 100, 1000), -- A4 Paper in Picking Area
(5, 7, 10, 8, 89.99, 3, 25),     -- Power Drills in Bulk Storage
(6, 7, 80, 75, 45.50, 20, 200),  -- Steel Sheets in Bulk Storage
(7, 2, 50, 45, 35.00, 15, 150);  -- Ink Cartridges in Storage Zone A

-- Insert sample receipts
INSERT INTO receipts (reference, schedule_date, status, supplier_id, responsible_user_id, to_location_id) VALUES
('REC-2024-001', '2024-11-15', 'done', 1, 1, 1),
('REC-2024-002', '2024-11-18', 'confirmed', 2, 2, 1),
('REC-2024-003', '2024-11-20', 'draft', 3, 1, 7),
('REC-2024-004', '2024-11-22', 'draft', 4, 3, 7),
('REC-2024-005', '2024-11-25', 'confirmed', 1, 2, 2),
('REC-2024-006', '2024-11-28', 'done', 2, 1, 4);

-- Insert sample receipt items
INSERT INTO receipt_items (receipt_id, product_id, quantity_expected, quantity_received, unit_cost_at_receipt) VALUES
(1, 1, 25, 25, 1200.00), -- Laptops
(1, 2, 100, 100, 25.99), -- Wireless Mouse
(2, 4, 200, 180, 8.99),  -- A4 Paper
(3, 5, 5, 0, 89.99),     -- Power Drills (not received yet)
(4, 6, 50, 0, 45.50),    -- Steel Sheets (not received yet)
(5, 1, 15, 0, 1180.00),  -- More laptops
(6, 7, 30, 30, 35.00);   -- Ink Cartridges

-- Insert sample delivery orders
INSERT INTO delivery_orders (reference, schedule_date, status, customer_id, responsible_user_id, from_location_id) VALUES
('DEL-2024-001', '2024-11-16', 'done', 1, 2, 2),
('DEL-2024-002', '2024-11-19', 'confirmed', 2, 1, 4),
('DEL-2024-003', '2024-11-21', 'draft', 3, 3, 2),
('DEL-2024-004', '2024-11-23', 'confirmed', 4, 2, 4),
('DEL-2024-005', '2024-11-26', 'draft', 1, 1, 2);

-- Insert sample delivery order items
INSERT INTO delivery_order_items (delivery_order_id, product_id, quantity_ordered, quantity_delivered) VALUES
(1, 1, 10, 10), -- Laptops to ABC Corporation
(1, 2, 50, 50), -- Wireless Mouse to ABC Corporation
(2, 4, 100, 0), -- A4 Paper to XYZ Enterprises (not delivered yet)
(3, 3, 5, 0),   -- Office Chairs to School District (not delivered yet)
(4, 7, 20, 0),  -- Ink Cartridges to City Government (not delivered yet)
(5, 2, 25, 0);  -- More Wireless Mouse to ABC Corporation (not delivered yet)

-- Insert sample move history
INSERT INTO move_history (transaction_ref, transaction_type, product_id, from_location_id, to_location_id, quantity_change, unit_of_measure, responsible_user_id, description) VALUES
('REC-2024-001', 'receipt', 1, NULL, 2, 25, 'PC', 1, 'Received laptops from TechCorp Solutions'),
('REC-2024-001', 'receipt', 2, NULL, 2, 100, 'PC', 1, 'Received wireless mice from TechCorp Solutions'),
('DEL-2024-001', 'delivery', 1, 2, NULL, -10, 'PC', 2, 'Delivered laptops to ABC Corporation'),
('DEL-2024-001', 'delivery', 2, 2, NULL, -50, 'PC', 2, 'Delivered wireless mice to ABC Corporation'),
('TRF-2024-001', 'transfer', 1, 2, 3, -5, 'PC', 1, 'Internal transfer of laptops'),
('TRF-2024-001', 'transfer', 1, 3, 2, 5, 'PC', 1, 'Internal transfer of laptops'),
('REC-2024-006', 'receipt', 7, NULL, 2, 30, 'PC', 1, 'Received ink cartridges from Office Depot Inc');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(1, 'Low Stock Alert', 'Power Drill stock is below minimum level', 'warning'),
(2, 'Receipt Confirmed', 'Receipt REC-2024-005 has been confirmed', 'info'),
(1, 'Delivery Completed', 'Delivery DEL-2024-001 has been completed successfully', 'success'),
(3, 'New Receipt', 'New receipt REC-2024-004 assigned to you', 'info'),
(2, 'Stock Adjustment', 'Stock adjustment required for Steel Sheets', 'warning');

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES
('company_name', 'StockShelf Inventory Management', 'Company name displayed in the system', 1),
('currency_symbol', 'Rs', 'Default currency symbol', 1),
('auto_refresh_interval', '30', 'Auto-refresh interval in seconds', 1),
('low_stock_threshold', '10', 'Default low stock threshold percentage', 1),
('backup_frequency', 'daily', 'Database backup frequency', 1);

-- Insert sample dashboard widgets
INSERT INTO dashboard_widgets (user_id, widget_type, position_x, position_y, width, height) VALUES
(1, 'stock_summary', 0, 0, 2, 1),
(1, 'recent_receipts', 2, 0, 2, 1),
(1, 'pending_deliveries', 0, 1, 2, 1),
(2, 'stock_summary', 0, 0, 3, 1),
(2, 'activity_log', 3, 0, 1, 2);

-- Insert sample activity log
INSERT INTO activity_log (user_id, action, table_name, record_id) VALUES
(1, 'CREATE', 'receipts', 1),
(1, 'UPDATE', 'receipts', 1),
(2, 'CREATE', 'delivery_orders', 1),
(3, 'UPDATE', 'stock_levels', 1),
(1, 'DELETE', 'products', 999);

-- Insert sample product barcodes
INSERT INTO product_barcodes (product_id, barcode, barcode_type) VALUES
(1, '1234567890123', 'EAN13'),
(2, '2345678901234', 'EAN13'),
(3, '3456789012345', 'EAN13'),
(4, '4567890123456', 'EAN13'),
(5, '5678901234567', 'EAN13'),
(6, '6789012345678', 'EAN13'),
(7, '7890123456789', 'EAN13');