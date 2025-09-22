-- BusBee Database Schema
-- Run this script to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for both regular users and bus owners
-- Note: Same phone number can be used for both 'user' and 'bus_owner' types
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    user_type VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' or 'bus_owner'
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT users_phone_user_type_unique UNIQUE (phone_number, user_type)
);

-- OTP table for verification
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL DEFAULT 'login', -- 'login', 'registration', 'password_reset'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bus owners profile (additional info for bus owners)
CREATE TABLE IF NOT EXISTS bus_owner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bus_owner_name VARCHAR(255),
    bus_name VARCHAR(255),
    bus_number VARCHAR(20),
    rc_book_number VARCHAR(100),
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buses table
CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bus_name VARCHAR(100) NOT NULL,
    number_plate VARCHAR(20) UNIQUE NOT NULL,
    total_seats INTEGER NOT NULL,
    bus_type VARCHAR(50), -- 'AC', 'Non-AC', 'Sleeper', etc.
    status VARCHAR(20) DEFAULT 'idle', -- 'on-route', 'parked', 'maintenance', 'idle'
    fuel_level INTEGER DEFAULT 100,
    next_service_date DATE,
    permit_expiry DATE,
    insurance_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bus routes mapping
CREATE TABLE IF NOT EXISTS bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_otps_phone ON otps(phone_number);
CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_buses_owner ON buses(owner_id);
CREATE INDEX IF NOT EXISTS idx_buses_status ON buses(status);

-- Insert some sample data
-- Note: Same phone number can be used for both user types
INSERT INTO users (phone_number, name, user_type, is_verified) VALUES
('9188593928', 'Test Bus Owner', 'bus_owner', true),
('9188593928', 'Test User', 'user', true),  -- Same phone, different user type
('9876543210', 'Another User', 'user', true)
ON CONFLICT (phone_number, user_type) DO NOTHING;

INSERT INTO routes (route_name, start_location, end_location, distance_km, estimated_duration_minutes) VALUES
('Kochi - Thrissur Express', 'Kochi', 'Thrissur', 75.5, 90),
('Ernakulam - Aluva Shuttle', 'Ernakulam', 'Aluva', 25.0, 45),
('Kochi - Kottayam Route', 'Kochi', 'Kottayam', 85.0, 120),
('Thrissur - Palakkad Line', 'Thrissur', 'Palakkad', 65.0, 80)
ON CONFLICT DO NOTHING;
