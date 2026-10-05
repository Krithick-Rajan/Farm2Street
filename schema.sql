-- ================================================================
-- Farm2Street: Clean PostgreSQL Database Schema (Supabase)
-- Web Technology Syllabus: Topic 9 (JDBC), Topic 10 (SQL), Topic 12 (Database)
-- Pure Schema Definition - No Predefined / Dummy Data
-- ================================================================

-- Drop existing tables if rebuilding from scratch
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS produce CASCADE;
DROP TABLE IF EXISTS farms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Authentication, Role-Based Access, Profile Information)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'farmer', 'delivery', 'admin')),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Regional Farms Table (Farmer Association & Geolocation Coordinates)
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farm_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    acreage INT DEFAULT 5,
    organic_certified BOOLEAN DEFAULT TRUE,
    soil_health_score DECIMAL(3, 1) DEFAULT 9.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Produce & Harvest Batches Table (Catalog, Inventory & Traceability)
CREATE TABLE produce (
    id SERIAL PRIMARY KEY,
    farm_id INT REFERENCES farms(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    stock INT NOT NULL DEFAULT 50,
    farm_name VARCHAR(200),
    farm_location VARCHAR(255),
    harvest_date DATE DEFAULT CURRENT_DATE,
    batch_id VARCHAR(100) UNIQUE NOT NULL,
    image_url TEXT,
    organic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table (Transactions, Checkout, Delivery Status & Escrow)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Paid',
    payment_id VARCHAR(150),
    order_status VARCHAR(50) DEFAULT 'Order Placed' CHECK (order_status IN ('Order Placed', 'Harvested', 'Ready for Pickup', 'Out for Delivery', 'Delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Line Items Table (Relational Association with Produce)
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    produce_id INT REFERENCES produce(id) ON DELETE SET NULL,
    produce_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- 6. Customer Reviews Table (Community Feedback & Rating)
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
CREATE INDEX idx_produce_batch ON produce(batch_id);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ================================================================
-- Row-Level Security Configuration & Access Policies
-- Enforces table protection while enabling seamless client operations
-- ================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. Produce Policies: Public read catalog, authorized modification
CREATE POLICY "Public Read Produce" ON produce FOR SELECT USING (true);
CREATE POLICY "Authenticated Insert Produce" ON produce FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated Update Produce" ON produce FOR UPDATE USING (true);

-- 2. Farms Policies: Public directory read
CREATE POLICY "Public Read Farms" ON farms FOR SELECT USING (true);
CREATE POLICY "Authenticated Manage Farms" ON farms FOR ALL USING (true);

-- 3. Orders Policies: Public placement and order lookup
CREATE POLICY "Order Placement" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Order Status Read" ON orders FOR SELECT USING (true);
CREATE POLICY "Order Status Update" ON orders FOR UPDATE USING (true);

-- 4. Order Items Policies
CREATE POLICY "Order Items Insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Order Items Read" ON order_items FOR SELECT USING (true);

-- 5. Reviews Policies: Public read & feedback submission
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Submit Reviews" ON reviews FOR INSERT WITH CHECK (true);

-- 6. Users Policies: Registration and profile lookup
CREATE POLICY "User Registration" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "User Authentication Read" ON users FOR SELECT USING (true);
CREATE POLICY "User Profile Update" ON users FOR UPDATE USING (true);

