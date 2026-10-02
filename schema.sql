-- ================================================================
-- Farm2Street: Supabase PostgreSQL Database Schema
-- Satisfies Web Technology Syllabus: Topic 9 (JDBC), Topic 10 (SQL), Topic 12 (Database)
-- ================================================================

-- 1. Users Table (Authentication, Roles, Sessions)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'farmer', 'delivery', 'admin')),
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Regional Farms Table (Leaflet / OpenStreetMap Coordinates)
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    farmer_id INT REFERENCES users(id) ON DELETE SET NULL,
    farm_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    acreage INT DEFAULT 5,
    organic_certified BOOLEAN DEFAULT TRUE,
    soil_health_score DECIMAL(3, 1) DEFAULT 9.4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Produce & Harvest Batches Table (Catalog & Traceability)
CREATE TABLE IF NOT EXISTS produce (
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

-- 4. Orders Table (Transactions, Escrow, Razorpay)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Paid',
    payment_id VARCHAR(150),
    order_status VARCHAR(50) DEFAULT 'Harvested' CHECK (order_status IN ('Order Placed', 'Harvested', 'Ready for Pickup', 'Out for Delivery', 'Delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Line Items Table (Relational Association)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    produce_id INT REFERENCES produce(id) ON DELETE SET NULL,
    produce_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- ================================================================
-- Starter Seed Data
-- ================================================================
INSERT INTO users (name, email, password_hash, role, phone, address)
VALUES 
('Marketplace Admin', 'admin@farm2street.org', 'admin123', 'admin', '+91 98800 11223', 'Central Operations Desk'),
('Ramesh Patil', 'farmer@farm2street.org', 'farm123', 'farmer', '+91 98220 14450', 'Sahyadri Agro Belt, Nashik'),
('Pooja Sharma', 'pooja@farm2street.org', 'pooja123', 'customer', '+91 98812 77410', 'Kalyani Nagar, Pune')
ON CONFLICT (email) DO NOTHING;

INSERT INTO farms (farm_name, district, latitude, longitude, acreage, organic_certified, soil_health_score)
VALUES 
('Sahyadri Agro Farms', 'Nashik', 19.9975, 73.7898, 12, TRUE, 9.6),
('GreenValley Hydroponics', 'Ozar', 20.0820, 73.9180, 6, TRUE, 9.8),
('Blue Mountain Orchards', 'Nilgiris', 11.4102, 76.6950, 20, TRUE, 9.4),
('Deccan Polyhouse Collective', 'Baramati', 18.1517, 74.5772, 15, TRUE, 9.1)
ON CONFLICT DO NOTHING;

-- 6. Customer Reviews Table (Dynamic Verified Reviews)
CREATE TABLE IF NOT EXISTS reviews (
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

INSERT INTO produce (name, category, price, unit, stock, farm_name, farm_location, harvest_date, batch_id, image_url, organic)
VALUES 
('Country Heirloom Tomatoes', 'Vine', 42.00, 'kg', 85, 'Sahyadri Agro Farms', 'Dindori, Nashik (19.99° N, 73.78° E)', CURRENT_DATE, 'BATCH-TM-882', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', TRUE),
('Hydroponic Baby Spinach', 'Leafy Greens', 35.00, 'bunch', 120, 'GreenValley Hydroponics', 'Ozar Agro-Cluster (20.08° N, 73.91° E)', CURRENT_DATE, 'BATCH-SP-104', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', TRUE),
('Crisp Ooty Orange Carrots', 'Root', 48.00, 'kg', 64, 'Blue Mountain Orchards', 'Nilgiris Belt (11.41° N, 76.69° E)', CURRENT_DATE - 1, 'BATCH-CR-552', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', TRUE),
('Sun-Ripened Bell Peppers', 'Vine', 65.00, 'kg', 40, 'Deccan Polyhouse Collective', 'Baramati (18.15° N, 74.57° E)', CURRENT_DATE, 'BATCH-BP-339', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80', TRUE),
('Tender Field Broccoli', 'Leafy Greens', 55.00, 'head', 50, 'Sahyadri Agro Farms', 'Mahabaleshwar Foothills (17.92° N, 73.81° E)', CURRENT_DATE, 'BATCH-BR-721', 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?auto=format&fit=crop&w=600&q=80', TRUE)
ON CONFLICT (batch_id) DO NOTHING;

INSERT INTO reviews (customer_name, customer_location, rating, title, comment, produce_name, verified_purchase, helpful_count)
VALUES
('Ananya Deshmukh', 'Coimbatore, Tamil Nadu', 5, 'Unbelievably fresh, crisp vegetables right from farm gate', 'The heirloom tomatoes and spinach tasted so different from supermarket items—you could literally smell the rich farm freshness.', 'Heirloom Vine Tomatoes', TRUE, 14),
('Karthik Subramanian', 'RS Puram, Coimbatore', 5, 'EV Cold Transit kept everything chilled and crisp', 'Ordered the Weekly Family Box. Delivered within 35 minutes via electric cargo vehicle. Bell peppers and coriander leaves were crisp.', 'Weekly Family Harvest Box', TRUE, 22),
('Dr. Meera Nambiar', 'Saibaba Colony, Coimbatore', 4, 'Lab-tested pesticide-free produce that our family trusts', 'Being a nutritionist, verifying the NPOP certification and pesticide screening report through the batch scan is phenomenal.', 'Organic Baby Spinach', TRUE, 9)
ON CONFLICT DO NOTHING;

