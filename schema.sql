-- ================================================================
-- Farm2Street: Pure Production PostgreSQL Database Schema (Supabase)
-- Web Technology Lab: Direct Agri-Marketplace & Traceability Engine
-- Compatible with Supabase PostgreSQL 16 & Jakarta EE 10 / Tomcat
-- (Zero Predefined Seed Inserts - Schema, Constraints, Triggers & Views Only)
-- ================================================================

-- Clean Drop for Schema Recreation
DROP VIEW IF EXISTS pending_disbursements_view CASCADE;
DROP VIEW IF EXISTS farmer_order_analytics_view CASCADE;
DROP VIEW IF EXISTS active_produce_catalog_view CASCADE;

DROP TRIGGER IF EXISTS trg_update_orders_updated_at ON orders CASCADE;
DROP TRIGGER IF EXISTS trg_create_farmer_farm ON users CASCADE;

DROP FUNCTION IF EXISTS update_orders_timestamp() CASCADE;
DROP FUNCTION IF EXISTS handle_new_farmer_registration() CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS produce CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------
-- 1. USERS TABLE
-- Clean separate Email and Mobile Phone columns
-- Supports Customer, Farmer, Delivery Partner, SuperAdmin
-- ----------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'farmer', 'delivery', 'admin')),
    farm_name VARCHAR(200),
    location VARCHAR(255),
    total_acres DECIMAL(6, 2) DEFAULT 5.0,
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(100),
    address TEXT,
    extra_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 2. REGIONAL FARMS TABLE
-- Farmer profiles, GPS location, Acreage, and Organic Verification
-- ----------------------------------------------------------------
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) DEFAULT 'Coimbatore',
    location VARCHAR(255) DEFAULT 'Coimbatore Agro Belt',
    latitude DECIMAL(9, 6) DEFAULT 11.0168,
    longitude DECIMAL(9, 6) DEFAULT 76.9558,
    acreage DECIMAL(6, 2) DEFAULT 5.0,
    organic_certified BOOLEAN DEFAULT TRUE,
    certification_number VARCHAR(100) DEFAULT 'NPOP/NAB/0018-ORG-2024',
    soil_health_score DECIMAL(3, 1) DEFAULT 9.4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 3. PRODUCE CATALOG & HARVEST BATCHES TABLE
-- Produce items listed by farmers with live batch traceability
-- ----------------------------------------------------------------
CREATE TABLE produce (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE SET NULL,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(150) NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    stock INT NOT NULL DEFAULT 50,
    farm_name VARCHAR(200),
    farm_location VARCHAR(255),
    harvest_date VARCHAR(100) DEFAULT 'Today 06:00 AM',
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    organic BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 4. ORDERS TABLE (Full 8-Stage Direct Agri Lifecycle)
-- Tracks customer orders from farm harvest to doorstep delivery
-- ----------------------------------------------------------------
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    delivery_address TEXT DEFAULT 'Address provided at checkout',
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(150) DEFAULT 'Sri Farm''s',
    farm_pickup_location VARCHAR(255) DEFAULT 'Coimbatore Agro Belt',
    delivery_partner_id INT REFERENCES users(id) ON DELETE SET NULL,
    delivery_partner_name VARCHAR(150),
    delivery_partner_phone VARCHAR(50),
    delivery_partner_vehicle VARCHAR(100),
    subtotal DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Razorpay UPI',
    payment_status VARCHAR(50) DEFAULT 'Paid',
    payment_id VARCHAR(150),
    razorpay_order_id VARCHAR(150),
    order_status VARCHAR(50) DEFAULT 'Order Placed' CHECK (order_status IN (
        'Order Placed',
        'Order Confirmed',
        'Preparing',
        'Ready for Pickup',
        'Delivery Partner Assigned',
        'Picked Up',
        'Out for Delivery',
        'Delivered'
    )),
    items_json JSONB DEFAULT '[]'::jsonb,
    timeline_json JSONB DEFAULT '[]'::jsonb,
    batch_id VARCHAR(100),
    distance_km DECIMAL(6, 2) DEFAULT 4.8,
    estimated_minutes INT DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 5. ORDER LINE ITEMS TABLE
-- Relational line items associated with produce and order
-- ----------------------------------------------------------------
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    produce_id INT REFERENCES produce(id) ON DELETE SET NULL,
    produce_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    subtotal DECIMAL(10, 2) NOT NULL,
    farmer_name VARCHAR(150)
);

-- ----------------------------------------------------------------
-- 6. SETTLEMENTS TABLE
-- Dynamic escrow payouts calculated upon order fulfillment
-- ----------------------------------------------------------------
CREATE TABLE settlements (
    id SERIAL PRIMARY KEY,
    settlement_code VARCHAR(100) UNIQUE NOT NULL,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    order_count INT NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed')),
    utr_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- 7. REVIEWS TABLE
-- Verified community ratings & feedback
-- ----------------------------------------------------------------
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_location VARCHAR(150),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    produce_name VARCHAR(150),
    verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- PERFORMANCE INDEXES
-- ================================================================
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_produce_batch ON produce(batch_id);
CREATE INDEX idx_produce_farmer ON produce(farmer_name);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_farmer ON orders(farmer_name);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_delivery_partner ON orders(delivery_partner_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_settlements_code ON settlements(settlement_code);
CREATE INDEX idx_settlements_farmer ON settlements(farmer_name);

-- ================================================================
-- TRIGGERS & STORED FUNCTIONS
-- ================================================================

-- Trigger 1: Auto-update orders updated_at timestamp on any status or partner change
CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_timestamp();

-- Trigger 2: Auto-create Farm profile when a Farmer registers
CREATE OR REPLACE FUNCTION handle_new_farmer_registration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'farmer' THEN
        INSERT INTO farms (
            farmer_id,
            farm_name,
            district,
            location,
            acreage,
            organic_certified
        ) VALUES (
            NEW.id,
            COALESCE(NULLIF(NEW.farm_name, ''), NEW.name || '''s Farm'),
            'Coimbatore',
            COALESCE(NULLIF(NEW.location, ''), 'Coimbatore Agro Belt'),
            COALESCE(NEW.total_acres, 5.0),
            TRUE
        )
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_farmer_farm
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION handle_new_farmer_registration();

-- ================================================================
-- VIEWS (Analytics & Aggregations)
-- ================================================================

-- View 1: Farmer Real-time Order & Revenue Pipeline
CREATE OR REPLACE VIEW farmer_order_analytics_view AS
SELECT
    farmer_name,
    COUNT(CASE WHEN order_status IN ('Order Placed', 'Order Confirmed', 'Preparing') THEN 1 END) AS orders_awaiting_prep,
    COUNT(CASE WHEN order_status = 'Ready for Pickup' THEN 1 END) AS orders_ready_for_pickup,
    COUNT(CASE WHEN order_status = 'Delivered' THEN 1 END) AS orders_delivered,
    COALESCE(SUM(CASE WHEN order_status = 'Delivered' THEN total_amount ELSE 0 END), 0) AS gross_delivered_revenue,
    COALESCE(SUM(CASE WHEN order_status IN ('Order Placed', 'Order Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery') THEN total_amount ELSE 0 END), 0) AS pending_settlement_amount
FROM orders
GROUP BY farmer_name;

-- View 2: Pending Razorpay T+1 Disbursements
CREATE OR REPLACE VIEW pending_disbursements_view AS
SELECT
    id AS order_id,
    order_code,
    farmer_name,
    total_amount,
    payment_method,
    payment_id,
    updated_at AS delivered_at,
    'ready_for_disbursement' AS payout_status
FROM orders
WHERE order_status = 'Delivered'
ORDER BY updated_at DESC;

-- View 3: Active Produce Catalog with Farm Details
CREATE OR REPLACE VIEW active_produce_catalog_view AS
SELECT
    p.id,
    p.name AS produce_name,
    p.category,
    p.price,
    p.unit,
    p.stock,
    p.batch_id,
    p.organic,
    p.rating,
    p.farmer_name,
    COALESCE(f.farm_name, p.farm_name) AS farm_name,
    COALESCE(f.location, p.farm_location) AS farm_location,
    COALESCE(f.organic_certified, TRUE) AS is_certified
FROM produce p
LEFT JOIN farms f ON p.farm_id = f.id;

-- ================================================================
-- ROW-LEVEL SECURITY & PERMISSIVE ACCESS POLICIES
-- ================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Users Select" ON users FOR SELECT USING (true);
CREATE POLICY "Public Users Insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Users Update" ON users FOR UPDATE USING (true);
CREATE POLICY "Public Users Delete" ON users FOR DELETE USING (true);

CREATE POLICY "Public Farms All" ON farms FOR ALL USING (true);
CREATE POLICY "Public Produce All" ON produce FOR ALL USING (true);
CREATE POLICY "Public Orders All" ON orders FOR ALL USING (true);
CREATE POLICY "Public Order Items All" ON order_items FOR ALL USING (true);
CREATE POLICY "Public Settlements All" ON settlements FOR ALL USING (true);
CREATE POLICY "Public Reviews All" ON reviews FOR ALL USING (true);

-- Enable Supabase Realtime replication on orders and produce
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE produce;
