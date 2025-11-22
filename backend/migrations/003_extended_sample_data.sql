-- Extended sample data for all 15 tables
-- This script populates comprehensive test data across the entire system

-- Additional users with proper password hashing
INSERT INTO users (login_id, email, password, user_role, first_name, last_name) VALUES
('operator2', 'operator2@stockmaster.com', '$2b$10$dummy_hashed_password', 'operator', 'Mike', 'Wilson'),
('operator3', 'operator3@stockmaster.com', '$2b$10$dummy_hashed_password', 'operator', 'Sarah', 'Johnson'),
('viewer1', 'viewer1@stockmaster.com', '$2b$10$dummy_hashed_password', 'viewer', 'Alex', 'Brown'),
('manager2', 'manager2@stockmaster.com', '$2b$10$dummy_hashed_password', 'manager', 'Emily', 'Davis'),
('supervisor1', 'supervisor@stockmaster.com', '$2b$10$dummy_hashed_password', 'manager', 'Robert', 'Taylor');

-- Additional warehouses
INSERT INTO warehouses (name, short_code, address) VALUES
('North Warehouse', 'NORTH', '901 Northern Industrial Park, Zone A'),
('South Warehouse', 'SOUTH', '902 Southern Logistics Hub, Zone B'),
('East Coast Facility', 'EAST', '903 Coastal Distribution Center, Port Side'),
('Overflow Storage', 'OVER', '904 Temporary Storage Facility, Outskirts');

-- Additional locations for new warehouses
INSERT INTO locations (name, short_code, warehouse_id, description) VALUES
-- North Warehouse locations
('North Receiving', 'NREC', 4, 'North warehouse receiving dock'),
('North Storage A', 'NSA', 4, 'North warehouse primary storage'),
('North Storage B', 'NSB', 4, 'North warehouse secondary storage'),
('North Shipping', 'NSHP', 4, 'North warehouse shipping area'),
-- South Warehouse locations  
('South Receiving', 'SREC', 5, 'South warehouse receiving area'),
('South Cold Zone', 'SCLD', 5, 'South warehouse refrigerated storage'),
('South Dry Goods', 'SDRY', 5, 'South warehouse dry goods storage'),
-- East Coast locations
('East Dock A', 'EDA', 6, 'East coast loading dock A'),
('East Dock B', 'EDB', 6, 'East coast loading dock B'),
('East Transit', 'ETRN', 6, 'East coast transit storage'),
-- Overflow locations
('Overflow A', 'OFA', 7, 'Overflow storage section A'),
('Overflow B', 'OFB', 7, 'Overflow storage section B');

-- Additional product categories
INSERT INTO product_categories (name, description) VALUES
('Furniture', 'Office and warehouse furniture'),
('Safety Equipment', 'Personal protective equipment and safety gear'),
('Cleaning Supplies', 'Janitorial and maintenance supplies'),
('Packaging Materials', 'Boxes, tape, labels, and packaging supplies'),
('IT Hardware', 'Computer hardware and networking equipment'),
('Automotive Parts', 'Vehicle maintenance and repair parts');

-- Additional products
INSERT INTO products (name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock) VALUES
-- Electronics
('Desktop Computer', 'DES-001', 1, 'PC', 800.00, 25),
('Monitor 24-inch', 'MON-001', 1, 'PC', 250.00, 40),
('Keyboard Wireless', 'KEY-001', 1, 'PC', 45.00, 100),
('USB Cable', 'USB-001', 1, 'PC', 12.99, 300),
('Network Switch', 'NET-001', 10, 'PC', 150.00, 20),
-- Office Supplies
('Whiteboard Markers', 'WBM-001', 2, 'SET', 15.99, 150),
('File Folders', 'FIL-001', 2, 'PK', 22.50, 200),
('Stapler Heavy Duty', 'STA-001', 2, 'PC', 35.00, 50),
-- Furniture
('Desk Standard', 'DSK-001', 6, 'PC', 450.00, 15),
('Bookshelf Metal', 'BSH-001', 6, 'PC', 180.00, 25),
('Conference Table', 'CTB-001', 6, 'PC', 1200.00, 5),
-- Safety Equipment
('Safety Helmet', 'SHE-001', 7, 'PC', 25.00, 100),
('Safety Vest', 'SVE-001', 7, 'PC', 18.00, 150),
('First Aid Kit', 'AID-001', 7, 'PC', 45.00, 30),
-- Cleaning Supplies
('Floor Cleaner', 'FLC-001', 8, 'BOT', 8.50, 200),
('Paper Towels', 'PTW-001', 8, 'RL', 3.25, 500),
('Trash Bags', 'TBG-001', 8, 'PK', 12.99, 300),
-- Packaging
('Cardboard Boxes', 'CBX-001', 9, 'PC', 2.50, 1000),
('Packing Tape', 'TPE-001', 9, 'RL', 4.99, 250),
('Bubble Wrap', 'BWR-001', 9, 'RL', 15.00, 100),
-- Automotive
('Motor Oil', 'OIL-001', 11, 'QT', 8.99, 200),
('Air Filter', 'AFI-001', 11, 'PC', 25.00, 75),
('Spark Plugs', 'SPK-001', 11, 'SET', 35.00, 50);

-- Additional suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('Global Electronics', 'Jennifer Chang', 'jennifer@globalelec.com', '+1-555-0105', '1001 Silicon Drive, Tech Valley'),
('Furniture Plus', 'Mark Thompson', 'mark@furnitureplus.com', '+1-555-0106', '1002 Design Avenue, Furniture District'),
('Safety First Corp', 'Linda Rodriguez', 'linda@safetyfirst.com', '+1-555-0107', '1003 Protection Blvd, Safety Zone'),
('Clean Solutions', 'James Wilson', 'james@cleansolutions.com', '+1-555-0108', '1004 Hygiene Street, Clean District'),
('PackMaster Inc', 'Rachel Green', 'rachel@packmaster.com', '+1-555-0109', '1005 Package Way, Shipping Zone'),
('AutoParts Direct', 'Kevin Moore', 'kevin@autoparts.com', '+1-555-0110', '1006 Motor Mile, Auto District');

-- Additional customers
INSERT INTO customers (name, contact_person, email, phone, address) VALUES
('Tech Startup Hub', 'Amanda Foster', 'amanda@techstartup.com', '+1-555-0205', '2001 Innovation Drive, Startup Plaza'),
('Manufacturing Corp', 'Steven Clark', 'steven@manufcorp.com', '+1-555-0206', '2002 Factory Row, Industrial Zone'),
('Retail Chain Store', 'Jessica White', 'jessica@retailchain.com', '+1-555-0207', '2003 Commerce Street, Shopping District'),
('Healthcare Network', 'Daniel Kim', 'daniel@healthcare.org', '+1-555-0208', '2004 Medical Center, Health Campus'),
('Construction Company', 'Michelle Lopez', 'michelle@construction.com', '+1-555-0209', '2005 Builder Avenue, Construction Zone'),
('Restaurant Group', 'Chris Anderson', 'chris@restaurantgroup.com', '+1-555-0210', '2006 Culinary Street, Food District');

-- Extended stock levels across all locations
INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use, min_stock_level, max_stock_level) VALUES
-- Electronics in various locations
(8, 9, 15, 12, 5, 30),    -- Desktop Computers in North Storage A
(9, 10, 25, 20, 8, 50),   -- Monitors in North Storage B
(10, 2, 80, 75, 25, 200), -- Keyboards in Main Storage A
(11, 3, 250, 220, 50, 500), -- USB Cables in Main Storage B
(12, 15, 15, 10, 5, 25),  -- Network Switches in East Dock A
-- Office supplies distribution
(13, 4, 100, 90, 30, 300), -- Whiteboard Markers in Picking Area
(14, 11, 150, 140, 40, 400), -- File Folders in South Dry Goods
(15, 5, 35, 30, 10, 80),  -- Staplers in Shipping Area
-- Furniture in bulk storage
(16, 7, 8, 5, 3, 20),     -- Desks in Bulk Storage
(17, 17, 18, 15, 5, 40),  -- Bookshelves in Overflow A
(18, 18, 3, 2, 1, 8),     -- Conference Tables in Overflow B
-- Safety equipment
(19, 6, 75, 70, 20, 150), -- Safety Helmets in Cold Storage
(20, 13, 120, 110, 40, 200), -- Safety Vests in South Cold Zone
(21, 14, 25, 20, 8, 50),  -- First Aid Kits in South Dry Goods
-- Cleaning supplies
(22, 8, 180, 150, 50, 400), -- Floor Cleaner in Distribution Floor
(23, 12, 450, 400, 100, 800), -- Paper Towels in South Receiving
(24, 16, 280, 250, 75, 500), -- Trash Bags in East Dock B
-- Packaging materials
(25, 1, 800, 750, 200, 1500), -- Cardboard Boxes in Receiving Area
(26, 4, 200, 180, 50, 400), -- Packing Tape in Picking Area
(27, 5, 80, 70, 20, 150), -- Bubble Wrap in Shipping Area
-- Automotive parts
(28, 11, 150, 140, 40, 300), -- Motor Oil in South Dry Goods
(29, 12, 60, 55, 20, 100), -- Air Filters in South Receiving
(30, 17, 40, 35, 15, 80);  -- Spark Plugs in Overflow A

-- Sample receipts (incoming inventory)
INSERT INTO receipts (reference, schedule_date, operation_type, supplier_id, responsible_user_id, from_location, to_location_id, status) VALUES
('REC-2024-001', '2024-11-15', 'purchase', 1, 2, 'TechCorp Warehouse', 1, 'done'),
('REC-2024-002', '2024-11-18', 'purchase', 2, 3, 'Office Depot DC', 4, 'confirmed'),
('REC-2024-003', '2024-11-20', 'purchase', 3, 2, 'Industrial Tools', 7, 'draft'),
('REC-2024-004', '2024-11-22', 'purchase', 5, 4, 'Global Electronics', 9, 'draft'),
('REC-2024-005', '2024-11-25', 'return', 6, 3, 'Customer Return', 2, 'confirmed'),
('REC-2024-006', '2024-11-28', 'transfer_in', NULL, 5, 'North Warehouse', 3, 'draft');

-- Sample receipt items
INSERT INTO receipt_items (receipt_id, product_id, quantity_expected, quantity_received, unit_cost_at_receipt) VALUES
-- REC-2024-001 items (completed)
(1, 1, 20, 20, 1200.00),
(1, 2, 50, 48, 25.99),
(1, 11, 100, 100, 12.99),
-- REC-2024-002 items (confirmed)
(2, 4, 200, 0, 8.99),
(2, 13, 50, 0, 15.99),
(2, 14, 100, 0, 22.50),
-- REC-2024-003 items (draft)
(3, 5, 10, 0, 89.99),
(3, 19, 50, 0, 25.00),
-- REC-2024-004 items (draft)
(4, 8, 15, 0, 800.00),
(4, 9, 20, 0, 250.00),
-- REC-2024-005 items (return)
(5, 1, 2, 2, 1200.00),
-- REC-2024-006 items (transfer)
(6, 16, 5, 0, 450.00);

-- Sample delivery orders (outgoing inventory)
INSERT INTO delivery_orders (reference, schedule_date, operation_type, customer_id, responsible_user_id, from_location_id, to_location, status) VALUES
('DEL-2024-001', '2024-11-16', 'sale', 1, 2, 2, 'ABC Corp Office', 'done'),
('DEL-2024-002', '2024-11-19', 'sale', 2, 3, 4, 'XYZ Enterprises', 'validated'),
('DEL-2024-003', '2024-11-21', 'sale', 3, 4, 2, 'School District', 'confirmed'),
('DEL-2024-004', '2024-11-23', 'transfer_out', NULL, 5, 3, 'South Warehouse', 'draft'),
('DEL-2024-005', '2024-11-26', 'sale', 5, 2, 7, 'Tech Startup', 'draft'),
('DEL-2024-006', '2024-11-29', 'sale', 6, 3, 9, 'Manufacturing Corp', 'confirmed');

-- Sample delivery order items  
INSERT INTO delivery_order_items (delivery_order_id, product_id, quantity_ordered, quantity_delivered) VALUES
-- DEL-2024-001 items (completed)
(1, 1, 5, 5),
(1, 3, 3, 3),
-- DEL-2024-002 items (validated)
(2, 4, 100, 100),
(2, 7, 25, 25),
-- DEL-2024-003 items (confirmed)
(3, 2, 30, 0),
(3, 4, 50, 0),
(3, 13, 20, 0),
-- DEL-2024-004 items (transfer out)
(4, 6, 25, 0),
-- DEL-2024-005 items (draft)
(5, 8, 8, 0),
(5, 9, 12, 0),
(5, 10, 30, 0),
-- DEL-2024-006 items (confirmed)
(6, 19, 40, 0),
(6, 20, 60, 0);

-- Sample internal transfers
INSERT INTO internal_transfers (reference, from_location_id, to_location_id, product_id, quantity, responsible_user_id, status, transfer_date) VALUES
('TRF-2024-001', 2, 4, 1, 5, 2, 'done', '2024-11-17'),
('TRF-2024-002', 3, 2, 2, 20, 3, 'done', '2024-11-18'),
('TRF-2024-003', 7, 9, 6, 15, 4, 'confirmed', '2024-11-20'),
('TRF-2024-004', 9, 11, 8, 3, 5, 'draft', '2024-11-22'),
('TRF-2024-005', 2, 15, 12, 8, 2, 'draft', '2024-11-24'),
('TRF-2024-006', 4, 1, 4, 50, 3, 'confirmed', '2024-11-25');

-- Sample stock adjustments
INSERT INTO stock_adjustments (adjustment_date, product_id, location_id, old_quantity, new_quantity, reason, responsible_user_id) VALUES
('2024-11-16', 1, 2, 35, 30, 'Physical count correction - found damaged units', 2),
('2024-11-17', 2, 2, 170, 150, 'Inventory audit adjustment', 3),
('2024-11-18', 4, 4, 450, 400, 'Expired products removed', 4),
('2024-11-19', 5, 7, 12, 10, 'Theft reported', 2),
('2024-11-20', 7, 2, 55, 50, 'Quality control rejection', 5),
('2024-11-21', 19, 6, 80, 75, 'Damaged during handling', 3);

-- Sample move history (audit trail)
INSERT INTO move_history (transaction_ref, transaction_type, product_id, from_location_id, to_location_id, quantity_change, unit_of_measure, responsible_user_id, description) VALUES
-- Receipt movements
('REC-2024-001', 'receipt', 1, NULL, 1, 20, 'PC', 2, 'Laptops received from TechCorp Solutions'),
('REC-2024-001', 'receipt', 2, NULL, 1, 48, 'PC', 2, 'Wireless mice received (2 damaged)'),
-- Transfer movements
('TRF-2024-001', 'transfer', 1, 2, 4, 5, 'PC', 2, 'Laptops moved to picking area for order'),
('TRF-2024-002', 'transfer', 2, 3, 2, 20, 'PC', 3, 'Mice consolidated to main storage'),
-- Delivery movements
('DEL-2024-001', 'delivery', 1, 2, NULL, -5, 'PC', 2, 'Laptops delivered to ABC Corporation'),
('DEL-2024-001', 'delivery', 3, 2, NULL, -3, 'PC', 2, 'Office chairs delivered to ABC Corporation'),
-- Adjustment movements
('ADJ-2024-001', 'adjustment', 1, 2, 2, -5, 'PC', 2, 'Damaged laptops written off'),
('ADJ-2024-002', 'adjustment', 2, 2, 2, -20, 'PC', 3, 'Inventory count correction'),
-- Additional movements for better history
('REC-2024-002', 'receipt', 4, NULL, 4, 200, 'PK', 3, 'A4 Paper received from Office Depot'),
('TRF-2024-003', 'transfer', 6, 7, 9, 15, 'SH', 4, 'Steel sheets moved to North warehouse'),
('DEL-2024-002', 'delivery', 7, 2, NULL, -25, 'PC', 3, 'Ink cartridges delivered to XYZ Enterprises'),
('ADJ-2024-003', 'adjustment', 4, 4, 4, -50, 'PK', 4, 'Expired paper products removed');

-- Update some stock levels to reflect the movements
UPDATE stock_levels SET quantity_on_hand = 25, quantity_free_to_use = 20 WHERE product_id = 1 AND location_id = 2;
UPDATE stock_levels SET quantity_on_hand = 130, quantity_free_to_use = 120 WHERE product_id = 2 AND location_id = 2;
UPDATE stock_levels SET quantity_on_hand = 12, quantity_free_to_use = 9 WHERE product_id = 3 AND location_id = 2;
UPDATE stock_levels SET quantity_on_hand = 350, quantity_free_to_use = 300 WHERE product_id = 4 AND location_id = 4;
UPDATE stock_levels SET quantity_on_hand = 8, quantity_free_to_use = 6 WHERE product_id = 5 AND location_id = 7;
UPDATE stock_levels SET quantity_on_hand = 65, quantity_free_to_use = 60 WHERE product_id = 6 AND location_id = 7;
UPDATE stock_levels SET quantity_on_hand = 25, quantity_free_to_use = 20 WHERE product_id = 7 AND location_id = 2;