-- Sample data for WMS system

-- Insert sample warehouses
INSERT INTO warehouses (code, name, address) VALUES
('WH001', '東京第一倉庫', '東京都江東区豊洲1-1-1'),
('WH002', '大阪第二倉庫', '大阪府大阪市住之江区南港北1-1-1');

-- Insert sample locations
INSERT INTO locations (warehouse_id, code, zone, aisle, rack, level, bin, capacity) VALUES
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A-1-1-A', 'A', '1', '1', 'A', '1', 100),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A-1-1-B', 'A', '1', '1', 'B', '1', 100),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A-1-2-A', 'A', '1', '2', 'A', '1', 100),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'A-2-1-A', 'A', '2', '1', 'A', '1', 100),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'B-1-1-A', 'B', '1', '1', 'A', '1', 150),
((SELECT id FROM warehouses WHERE code = 'WH001'), 'B-1-1-B', 'B', '1', '1', 'B', '1', 150),
((SELECT id FROM warehouses WHERE code = 'WH002'), 'A-1-1-A', 'A', '1', '1', 'A', '1', 120),
((SELECT id FROM warehouses WHERE code = 'WH002'), 'A-1-2-A', 'A', '1', '2', 'A', '1', 120);

-- Insert sample products
INSERT INTO products (sku, name, description, category, unit, weight, volume, barcode, min_stock, max_stock) VALUES
('SKU-001', 'ノートパソコン ThinkPad X1', '14インチ ビジネスノートPC', 'パソコン', 'PCS', 1.350, 0.002, '4901234567890', 10, 100),
('SKU-002', 'ワイヤレスマウス M705', 'ロジクール ワイヤレスマウス', '周辺機器', 'PCS', 0.135, 0.0001, '4901234567891', 20, 200),
('SKU-003', 'USB-C ハブ', '7in1 USB-C マルチハブ', '周辺機器', 'PCS', 0.180, 0.0002, '4901234567892', 15, 150),
('SKU-004', 'モニター 27インチ', '4K UHD モニター', 'モニター', 'PCS', 5.200, 0.015, '4901234567893', 5, 50),
('SKU-005', 'キーボード MX Keys', 'ロジクール ワイヤレスキーボード', '周辺機器', 'PCS', 0.810, 0.001, '4901234567894', 25, 250),
('SKU-006', 'プリンター レーザー', 'モノクロレーザープリンター', 'プリンター', 'PCS', 12.500, 0.035, '4901234567895', 3, 30),
('SKU-007', 'スマートフォン iPhone15', 'Apple iPhone 15 128GB', 'スマートフォン', 'PCS', 0.171, 0.0001, '4901234567896', 8, 80),
('SKU-008', 'タブレット iPad Air', 'Apple iPad Air 256GB', 'タブレット', 'PCS', 0.462, 0.0003, '4901234567897', 12, 120);

-- Insert sample inventory
INSERT INTO inventory (product_id, location_id, quantity, lot_number, expiry_date) VALUES
((SELECT id FROM products WHERE sku = 'SKU-001'), (SELECT id FROM locations WHERE code = 'A-1-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 45, 'LOT2024001', NULL),
((SELECT id FROM products WHERE sku = 'SKU-002'), (SELECT id FROM locations WHERE code = 'A-1-1-B' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 120, 'LOT2024002', NULL),
((SELECT id FROM products WHERE sku = 'SKU-003'), (SELECT id FROM locations WHERE code = 'A-1-2-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 85, 'LOT2024003', NULL),
((SELECT id FROM products WHERE sku = 'SKU-004'), (SELECT id FROM locations WHERE code = 'A-2-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 25, 'LOT2024004', NULL),
((SELECT id FROM products WHERE sku = 'SKU-005'), (SELECT id FROM locations WHERE code = 'B-1-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 150, 'LOT2024005', NULL),
((SELECT id FROM products WHERE sku = 'SKU-006'), (SELECT id FROM locations WHERE code = 'B-1-1-B' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 15, 'LOT2024006', NULL),
((SELECT id FROM products WHERE sku = 'SKU-007'), (SELECT id FROM locations WHERE code = 'A-1-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH002')), 35, 'LOT2024007', NULL),
((SELECT id FROM products WHERE sku = 'SKU-008'), (SELECT id FROM locations WHERE code = 'A-1-2-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH002')), 60, 'LOT2024008', NULL);

-- Insert sample inbound orders
INSERT INTO inbound_orders (order_number, supplier_name, expected_date, status, notes) VALUES
('IN-20240101-001', 'Lenovo Japan', '2024-12-15', 'PENDING', 'ノートパソコン追加入庫'),
('IN-20240101-002', 'Logitech Japan', '2024-12-16', 'RECEIVING', 'マウス・キーボード入庫'),
('IN-20240101-003', 'Dell Technologies', '2024-12-14', 'COMPLETED', 'モニター入庫完了');

-- Insert sample inbound order items
INSERT INTO inbound_order_items (inbound_order_id, product_id, expected_quantity, received_quantity, lot_number) VALUES
((SELECT id FROM inbound_orders WHERE order_number = 'IN-20240101-001'), (SELECT id FROM products WHERE sku = 'SKU-001'), 20, 0, 'LOT2024009'),
((SELECT id FROM inbound_orders WHERE order_number = 'IN-20240101-002'), (SELECT id FROM products WHERE sku = 'SKU-002'), 50, 30, 'LOT2024010'),
((SELECT id FROM inbound_orders WHERE order_number = 'IN-20240101-002'), (SELECT id FROM products WHERE sku = 'SKU-005'), 40, 25, 'LOT2024011'),
((SELECT id FROM inbound_orders WHERE order_number = 'IN-20240101-003'), (SELECT id FROM products WHERE sku = 'SKU-004'), 10, 10, 'LOT2024012');

-- Insert sample outbound orders
INSERT INTO outbound_orders (order_number, customer_name, delivery_address, ship_date, status, priority, notes) VALUES
('OUT-20240101-001', '株式会社ABC商事', '東京都千代田区丸の内1-1-1', '2024-12-15', 'PENDING', 2, 'オフィス設備一式'),
('OUT-20240101-002', '株式会社XYZ商会', '大阪府大阪市中央区本町1-1-1', '2024-12-16', 'PICKING', 1, '緊急発送'),
('OUT-20240101-003', '株式会社DEF物産', '愛知県名古屋市中区栄1-1-1', '2024-12-17', 'SHIPPED', 3, '通常発送'),
('OUT-20240101-004', '合同会社GHI商店', '福岡県福岡市博多区博多駅前1-1-1', '2024-12-18', 'SHIPPED', 3, '発送済み');

-- Insert sample outbound order items
INSERT INTO outbound_order_items (outbound_order_id, product_id, requested_quantity, allocated_quantity, picked_quantity, shipped_quantity) VALUES
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-001'), (SELECT id FROM products WHERE sku = 'SKU-001'), 5, 5, 0, 0),
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-001'), (SELECT id FROM products WHERE sku = 'SKU-004'), 2, 2, 0, 0),
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-002'), (SELECT id FROM products WHERE sku = 'SKU-007'), 10, 10, 8, 0),
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-003'), (SELECT id FROM products WHERE sku = 'SKU-002'), 15, 15, 15, 15),
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-003'), (SELECT id FROM products WHERE sku = 'SKU-003'), 8, 8, 8, 8),
((SELECT id FROM outbound_orders WHERE order_number = 'OUT-20240101-004'), (SELECT id FROM products WHERE sku = 'SKU-005'), 12, 12, 12, 12);

-- Insert sample inventory movements
INSERT INTO inventory_movements (product_id, from_location_id, to_location_id, quantity, movement_type, reference_type, reason, performed_by) VALUES
((SELECT id FROM products WHERE sku = 'SKU-001'), NULL, (SELECT id FROM locations WHERE code = 'A-1-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 50, 'IN', 'INBOUND', '初期在庫', 'System'),
((SELECT id FROM products WHERE sku = 'SKU-002'), NULL, (SELECT id FROM locations WHERE code = 'A-1-1-B' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 150, 'IN', 'INBOUND', '初期在庫', 'System'),
((SELECT id FROM products WHERE sku = 'SKU-002'), (SELECT id FROM locations WHERE code = 'A-1-1-B' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), NULL, 30, 'OUT', 'OUTBOUND', '出庫', 'System'),
((SELECT id FROM products WHERE sku = 'SKU-001'), (SELECT id FROM locations WHERE code = 'A-1-1-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), (SELECT id FROM locations WHERE code = 'A-1-2-A' AND warehouse_id = (SELECT id FROM warehouses WHERE code = 'WH001')), 5, 'TRANSFER', 'MANUAL', 'ロケーション変更', 'User');