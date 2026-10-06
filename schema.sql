-- ================================================================
-- Farm2Street: Full Production PostgreSQL Database Schema (Supabase)
-- Web Technology Lab: Real-time Direct Agri-Marketplace & Cold-Chain Logistics
-- Compatible with Supabase PostgreSQL 16 & Jakarta EE 10 Tomcat Backend
-- ================================================================

-- Drop existing tables cleanly if rebuilding from scratch
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS produce CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Authentication, Multi-Role Access Control)
-- Supports separate real email & real mobile phone without predefined dummy email domains
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

-- 2. Regional Farms Table (Farmer Registry & Geolocation)
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farm_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) DEFAULT 'Coimbatore',
    location VARCHAR(255) DEFAULT 'Coimbatore Agro Belt',
    latitude DECIMAL(9, 6) DEFAULT 11.0168,
    longitude DECIMAL(9, 6) DEFAULT 76.9558,
    acreage DECIMAL(6, 2) DEFAULT 8.5,
    organic_certified BOOLEAN DEFAULT TRUE,
    certification_number VARCHAR(100) DEFAULT 'NPOP/NAB/0018-ORG-2024',
    soil_health_score DECIMAL(3, 1) DEFAULT 9.4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Produce & Harvest Batches Table (Catalog, Inventory & Traceability)
CREATE TABLE produce (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE SET NULL,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(150) DEFAULT 'Sri Farm''s',
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    stock INT NOT NULL DEFAULT 50,
    farm_name VARCHAR(200) DEFAULT 'Sri Farm''s',
    farm_location VARCHAR(255) DEFAULT 'Coimbatore Agro Belt',
    harvest_date VARCHAR(100) DEFAULT 'Today 06:00 AM',
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    organic BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2, 1) DEFAULT 4.9,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table (Full 8-Stage Lifecycle, Relational & JSON Support)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    delivery_address TEXT NOT NULL,
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

-- 5. Order Line Items Table (Relational Association with Produce)
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

-- 6. Farmer Settlements Table (T+1 Automated Escrow Disbursements)
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

-- 7. Customer Reviews Table (Community Feedback & Rating)
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
-- Performance Indexes
-- ================================================================
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_produce_batch ON produce(batch_id);
CREATE INDEX idx_produce_farmer ON produce(farmer_name);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_farmer ON orders(farmer_name);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_settlements_code ON settlements(settlement_code);

-- ================================================================
-- Row-Level Security Configuration & Access Policies
-- Permissive policies enabling seamless client read/write access
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

-- ================================================================
-- Initial Seed Data: Verified Real Accounts
-- ================================================================

-- Real Platform Accounts
INSERT INTO users (id, name, email, phone, password_hash, role, farm_name, location, total_acres, vehicle_type, vehicle_number, address)
VALUES
(1, 'Reshmi', 'reshmi@f2s.com', '6369874535', 'reshmi@123', 'customer', NULL, 'CIT College, Coimbatore', NULL, NULL, NULL, 'CIT College, Coimbatore'),
(2, 'Sri', 'sri@f2s.com', '8965214756', 'sri@123', 'farmer', 'Sri Farm''s', 'Coimbatore Agro Belt', 8.5, NULL, NULL, 'Coimbatore'),
(3, 'Gobi', 'gobi@f2s.com', '8974563215', 'gobi@123', 'delivery', NULL, 'Coimbatore', NULL, 'Electric Transit Cargo', 'EV-TRANSIT-01', 'Coimbatore'),
(4, 'Krithick Rajan', 'krithick@f2s.com', '7896543210', 'krithick@123', 'admin', NULL, 'Coimbatore', NULL, NULL, NULL, 'Coimbatore')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    farm_name = EXCLUDED.farm_name,
    location = EXCLUDED.location;

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Real Farm for Sri
INSERT INTO farms (id, farmer_id, farm_name, district, location, acreage, organic_certified, certification_number)
VALUES
(1, 2, 'Sri Farm''s', 'Coimbatore', 'Coimbatore Agro Belt', 8.5, TRUE, 'NPOP/NAB/0018-ORG-2024')
ON CONFLICT (id) DO UPDATE SET
    farm_name = EXCLUDED.farm_name,
    district = EXCLUDED.district;

SELECT setval('farms_id_seq', (SELECT MAX(id) FROM farms));

-- Real Produce Catalog (Directly linked to Sri Farm's)
INSERT INTO produce (id, farm_id, farmer_id, farmer_name, name, category, price, unit, stock, farm_name, farm_location, harvest_date, batch_id, image_url, organic, rating, description)
VALUES
(1, 1, 2, 'Sri Farm''s', 'Heirloom Vine Tomatoes', 'Vegetables', 35.00, 'kg', 120, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Today 06:00 AM', 'F2S-TM-20260920-01', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85', TRUE, 4.9, 'Fresh field-ripened tomatoes sourced directly from Sri Farm beds.'),
(2, 1, 2, 'Sri Farm''s', 'Organic Country Carrots', 'Root', 50.00, 'kg', 200, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Yesterday 04:00 PM', 'F2S-CR-20260919-02', 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=85', TRUE, 4.9, 'Crisp sweet clay-grown carrots washed with pure well water.'),
(3, 1, 2, 'Sri Farm''s', 'Crisp Green Beans', 'Vegetables', 60.00, 'kg', 90, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Today 06:15 AM', 'F2S-GB-20260920-03', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=900&q=85', TRUE, 4.7, 'Crisp hand-picked tender beans with sweet snap.'),
(4, 1, 2, 'Sri Farm''s', 'Organic Baby Spinach', 'Greens', 25.00, 'bunch', 85, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Today 05:30 AM', 'F2S-SP-20260920-04', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85', TRUE, 4.8, 'Lush morning-harvested green leaves packed with natural minerals.'),
(5, 1, 2, 'Sri Farm''s', 'Wild Farm Mushrooms', 'Exotic', 110.00, '200g pack', 45, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Today 07:00 AM', 'F2S-MR-20260920-08', 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&q=80', TRUE, 5.0, 'Cultivated on organic straw. Velvety texture and savory woodsy flavor.'),
(6, 1, 2, 'Sri Farm''s', 'Crisp Bell Peppers', 'Vegetables', 80.00, 'kg', 60, 'Sri Farm''s', 'Coimbatore Agro Belt (12 km)', 'Today 06:30 AM', 'F2S-BP-20260920-05', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80', TRUE, 4.8, 'Greenhouse grown bell peppers with thick juicy flesh.')
ON CONFLICT (id) DO UPDATE SET
    farmer_name = EXCLUDED.farmer_name,
    farm_name = EXCLUDED.farm_name,
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock;

SELECT setval('produce_id_seq', (SELECT MAX(id) FROM produce));

-- Verified Customer Reviews
INSERT INTO reviews (customer_name, customer_location, rating, title, comment, produce_name, verified_purchase, helpful_count)
VALUES
('Ananya Deshmukh', 'Coimbatore, Tamil Nadu', 5, 'Unbelievably fresh, crisp vegetables right from farm gate', 'The heirloom tomatoes and spinach tasted so different from supermarket items—you could literally smell the rich farm freshness.', 'Heirloom Vine Tomatoes', TRUE, 14),
('Karthik Subramanian', 'RS Puram, Coimbatore', 5, 'EV Cold Transit kept everything chilled and crisp', 'Ordered the Weekly Family Box. Delivered within 35 minutes via electric cargo vehicle. Bell peppers were crisp with zero wilting.', 'Crisp Bell Peppers', TRUE, 22),
('Dr. Meera Nambiar', 'Saibaba Colony, Coimbatore', 4, 'Lab-tested pesticide-free produce that our family trusts', 'Being a nutritionist, verifying the NPOP certification and pesticide screening report through the batch scan is phenomenal.', 'Organic Baby Spinach', TRUE, 9);
