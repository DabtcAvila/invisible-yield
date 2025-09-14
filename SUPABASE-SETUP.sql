-- 🗄️ SUPABASE MIGRATION SCRIPT
-- Run these commands in your Supabase SQL editor

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'ChipiPay',
    balance_strk DECIMAL(18, 6) DEFAULT 0,
    balance_usdc DECIMAL(18, 6) DEFAULT 0,
    balance_btc DECIMAL(18, 8) DEFAULT 0,
    total_yield_earned DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    token VARCHAR(10) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create yield_positions table
CREATE TABLE yield_positions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(255) NOT NULL,
    protocol VARCHAR(50) NOT NULL,
    token_pair VARCHAR(20) NOT NULL,
    amount_deposited DECIMAL(18, 6) NOT NULL,
    current_value DECIMAL(18, 6) NOT NULL,
    apy DECIMAL(5, 2) NOT NULL,
    rewards_earned DECIMAL(18, 6) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_payments_addresses ON payments(from_address, to_address);
CREATE INDEX idx_yield_positions_user ON yield_positions(user_address);

-- Insert sample data
INSERT INTO users (username, address, email, provider, balance_strk, balance_usdc, total_yield_earned) VALUES
('demo_user_1', '0x1234567890abcdef1234567890abcdef12345678', 'demo1@hackathon.com', 'ChipiPay', 1000, 500, 15.75),
('demo_user_2', '0xabcdef1234567890abcdef1234567890abcdef12', 'demo2@hackathon.com', 'Braavos', 2500, 1200, 42.33),
('demo_user_3', '0x567890abcdef1234567890abcdef1234567890ab', 'demo3@hackathon.com', 'ArgentX', 5000, 3000, 125.89);

INSERT INTO yield_positions (user_address, protocol, token_pair, amount_deposited, current_value, apy, rewards_earned) VALUES
('0x1234567890abcdef1234567890abcdef12345678', 'JediSwap', 'STRK/USDC', 1000, 1025.50, 32.5, 15.75),
('0xabcdef1234567890abcdef1234567890abcdef12', 'AVNU', 'ETH/USDC', 2500, 2605.33, 28.7, 42.33),
('0x567890abcdef1234567890abcdef1234567890ab', 'MySwap', 'STRK/ETH', 5000, 5425.89, 35.2, 125.89);

