-- 🗄️ INVISIBLE YIELD - SUPABASE MIGRATION SCRIPT
-- StarkNet Hackathon 2024 - Production Database Setup

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS yield_positions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
    balance_eth DECIMAL(18, 6) DEFAULT 0,
    total_yield_earned DECIMAL(18, 6) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    profile_data JSONB DEFAULT '{}'
);

-- Create payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    from_username VARCHAR(255),
    from_address VARCHAR(255) NOT NULL,
    to_username VARCHAR(255),
    to_address VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    token VARCHAR(10) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_type VARCHAR(20) DEFAULT 'invisible',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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
    last_compound TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    position_data JSONB DEFAULT '{}'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_address ON users(address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_active ON users(is_active);

-- Payments indexes
CREATE INDEX idx_payments_from_address ON payments(from_address);
CREATE INDEX idx_payments_to_address ON payments(to_address);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);

-- Yield positions indexes
CREATE INDEX idx_yield_positions_user ON yield_positions(user_address);
CREATE INDEX idx_yield_positions_protocol ON yield_positions(protocol);
CREATE INDEX idx_yield_positions_active ON yield_positions(is_active);
CREATE INDEX idx_yield_positions_apy ON yield_positions(apy);

-- ============================================================================
-- DEMO DATA FOR HACKATHON
-- ============================================================================

-- Insert demo users
INSERT INTO users (username, address, email, provider, balance_strk, balance_usdc, balance_btc, balance_eth, total_yield_earned, profile_data) VALUES
('demo_alice', '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 'alice@hackathon.com', 'ChipiPay', 5000.000000, 2500.000000, 0.05000000, 1.250000, 157.500000, '{"avatar": "🦄", "tier": "gold"}'),
('demo_bob', '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 'bob@hackathon.com', 'Braavos', 12000.000000, 6000.000000, 0.12000000, 3.000000, 423.330000, '{"avatar": "🐻", "tier": "platinum"}'),
('demo_charlie', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 'charlie@hackathon.com', 'ArgentX', 25000.000000, 15000.000000, 0.25000000, 6.250000, 1258.890000, '{"avatar": "🚀", "tier": "diamond"}'),
('demo_diana', '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9', 'diana@hackathon.com', 'ChipiPay', 8000.000000, 4000.000000, 0.08000000, 2.000000, 287.450000, '{"avatar": "🌟", "tier": "silver"}'),
('hackathon_judge_1', '0x01435498bf393f3645a72cc03e5b5e4dd46d79b29d8b12e0f5b7e3c0e1b2a3c4', 'judge1@starknet.com', 'Braavos', 50000.000000, 30000.000000, 0.50000000, 12.500000, 2876.540000, '{"avatar": "⚖️", "tier": "judge"}');

-- Insert demo payments
INSERT INTO payments (from_username, from_address, to_username, to_address, amount, token, tx_hash, status, payment_type) VALUES
('demo_alice', '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 'demo_bob', '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 100.000000, 'USDC', '0xabc123def456789012345678901234567890123456789012345678901234567890', 'completed', 'invisible'),
('demo_bob', '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 'demo_charlie', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 250.000000, 'STRK', '0xdef456789012345678901234567890123456789012345678901234567890abcd', 'completed', 'invisible'),
('demo_charlie', '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 'demo_diana', '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9', 500.000000, 'ETH', '0x789012345678901234567890123456789012345678901234567890abcdef12', 'completed', 'lightning'),
('demo_diana', '0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9', 'hackathon_judge_1', '0x01435498bf393f3645a72cc03e5b5e4dd46d79b29d8b12e0f5b7e3c0e1b2a3c4', 1000.000000, 'USDC', '0x567890123456789012345678901234567890123456789012345678abcdef123', 'completed', 'invisible');

-- Insert demo yield positions
INSERT INTO yield_positions (user_address, protocol, token_pair, amount_deposited, current_value, apy, rewards_earned, position_data) VALUES
('0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', 'JediSwap', 'STRK/USDC', 2500.000000, 2657.500000, 32.50, 157.500000, '{"pool_id": "0x123", "last_harvest": "2024-01-15T10:30:00Z"}'),
('0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8', 'AVNU', 'ETH/USDC', 6000.000000, 6423.330000, 28.70, 423.330000, '{"pool_id": "0x456", "last_harvest": "2024-01-15T11:15:00Z"}'),
('0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', 'MySwap', 'STRK/ETH', 15000.000000, 16258.890000, 35.20, 1258.890000, '{"pool_id": "0x789", "last_harvest": "2024-01-15T12:00:00Z"}'),
('0x03e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9', '10KSwap', 'USDC/STRK', 4000.000000, 4287.450000, 29.80, 287.450000, '{"pool_id": "0xabc", "last_harvest": "2024-01-15T12:45:00Z"}'),
('0x01435498bf393f3645a72cc03e5b5e4dd46d79b29d8b12e0f5b7e3c0e1b2a3c4', 'SithSwap', 'BTC/ETH', 30000.000000, 32876.540000, 38.90, 2876.540000, '{"pool_id": "0xdef", "last_harvest": "2024-01-15T13:30:00Z"}');

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yield_positions_updated_at BEFORE UPDATE ON yield_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Platform stats view
CREATE VIEW platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
    (SELECT COUNT(*) FROM payments WHERE status = 'completed') as total_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_volume,
    (SELECT COUNT(*) FROM yield_positions WHERE is_active = true) as total_yield_positions,
    (SELECT COALESCE(SUM(current_value), 0) FROM yield_positions WHERE is_active = true) as total_tvl,
    (SELECT COALESCE(AVG(apy), 0) FROM yield_positions WHERE is_active = true) as average_apy,
    (SELECT COALESCE(SUM(rewards_earned), 0) FROM yield_positions WHERE is_active = true) as total_rewards_earned;

-- User stats view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.address,
    u.provider,
    u.total_yield_earned,
    COALESCE(yp.active_positions, 0) as active_positions,
    COALESCE(yp.total_deposited, 0) as total_deposited,
    COALESCE(yp.current_value, 0) as current_value,
    COALESCE(p.payment_count, 0) as payment_count,
    u.created_at
FROM users u
LEFT JOIN (
    SELECT 
        user_address,
        COUNT(*) as active_positions,
        SUM(amount_deposited) as total_deposited,
        SUM(current_value) as current_value
    FROM yield_positions 
    WHERE is_active = true 
    GROUP BY user_address
) yp ON u.address = yp.user_address
LEFT JOIN (
    SELECT 
        from_address,
        COUNT(*) as payment_count
    FROM payments 
    WHERE status = 'completed'
    GROUP BY from_address
) p ON u.address = p.from_address;

-- ============================================================================
-- FINAL SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ INVISIBLE YIELD DATABASE MIGRATION COMPLETED!';
    RAISE NOTICE '📊 Tables created: users, payments, yield_positions';
    RAISE NOTICE '🔍 Indexes created for optimal performance';
    RAISE NOTICE '📈 Views created: platform_stats, user_stats';
    RAISE NOTICE '🎯 Demo data inserted for hackathon demo';
    RAISE NOTICE '🚀 Database ready for production!';
END $$;