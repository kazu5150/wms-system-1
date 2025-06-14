-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Warehouses table
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    zone VARCHAR(10),
    aisle VARCHAR(10),
    rack VARCHAR(10),
    level VARCHAR(10),
    bin VARCHAR(10),
    capacity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(warehouse_id, code)
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'PCS',
    weight DECIMAL(10,3),
    volume DECIMAL(10,3),
    barcode VARCHAR(100),
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 999999,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    lot_number VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location_id, lot_number)
);

-- Inventory movements table
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUST')),
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT,
    performed_by VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inbound orders table
CREATE TABLE inbound_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_name VARCHAR(200),
    expected_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inbound order items table
CREATE TABLE inbound_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inbound_order_id UUID NOT NULL REFERENCES inbound_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    expected_quantity INTEGER NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    lot_number VARCHAR(100),
    expiry_date DATE
);

-- Outbound orders table
CREATE TABLE outbound_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(200),
    delivery_address TEXT,
    ship_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PICKING', 'PACKING', 'SHIPPED', 'CANCELLED')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outbound order items table
CREATE TABLE outbound_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbound_order_id UUID NOT NULL REFERENCES outbound_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    requested_quantity INTEGER NOT NULL,
    allocated_quantity INTEGER DEFAULT 0,
    picked_quantity INTEGER DEFAULT 0,
    shipped_quantity INTEGER DEFAULT 0
);

-- Picking tasks table
CREATE TABLE picking_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbound_order_id UUID NOT NULL REFERENCES outbound_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    assigned_to VARCHAR(200),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory adjustments table
CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adjustment_number VARCHAR(100) UNIQUE NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('CYCLE_COUNT', 'PHYSICAL_COUNT', 'DAMAGE', 'LOSS')),
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'COMPLETED')),
    notes TEXT,
    created_by VARCHAR(200),
    approved_by VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- System logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_movements_from_location ON inventory_movements(from_location_id);
CREATE INDEX idx_movements_to_location ON inventory_movements(to_location_id);
CREATE INDEX idx_inbound_items_order ON inbound_order_items(inbound_order_id);
CREATE INDEX idx_outbound_items_order ON outbound_order_items(outbound_order_id);
CREATE INDEX idx_picking_order ON picking_tasks(outbound_order_id);
CREATE INDEX idx_system_logs_table_record ON system_logs(table_name, record_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_inbound_orders_updated_at BEFORE UPDATE ON inbound_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_outbound_orders_updated_at BEFORE UPDATE ON outbound_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();