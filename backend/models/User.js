// REAL User Model for Invisible Yield Backend
// StarkNet Hackathon 2024 - PRODUCTION READY

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');

class UserModel {
    constructor() {
        // Initialize SQLite database
        const dbPath = path.join(__dirname, '../database/invisible_yield.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err);
            } else {
                console.log('✅ Connected to SQLite database');
                this.initializeTables();
            }
        });
    }

    // Initialize database tables
    initializeTables() {
        const userTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                email_hash TEXT NOT NULL,
                provider TEXT NOT NULL DEFAULT 'ChipiPay',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                gasless_quota INTEGER DEFAULT 100,
                total_yield_earned REAL DEFAULT 0,
                kyc_verified BOOLEAN DEFAULT 0
            )
        `;

        const notificationsTable = `
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                data TEXT, -- JSON string for additional data
                read_status BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        const paymentsTable = `
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_user_id INTEGER NOT NULL,
                to_user_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                token TEXT NOT NULL DEFAULT 'USDC',
                message TEXT,
                tx_hash TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'pending',
                invisible BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_user_id) REFERENCES users (id),
                FOREIGN KEY (to_user_id) REFERENCES users (id)
            )
        `;

        const yieldPositionsTable = `
            CREATE TABLE IF NOT EXISTS yield_positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                strategy_id TEXT NOT NULL,
                strategy_name TEXT NOT NULL,
                amount_btc REAL NOT NULL,
                amount_sats INTEGER NOT NULL,
                apy REAL NOT NULL,
                deposit_tx_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        const activityLogTable = `
            CREATE TABLE IF NOT EXISTS activity_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                ip_address TEXT,
                user_agent TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        // Execute table creation
        this.db.serialize(() => {
            this.db.run(userTable);
            this.db.run(notificationsTable);
            this.db.run(paymentsTable);
            this.db.run(yieldPositionsTable);
            this.db.run(activityLogTable);
        });

        console.log('✅ Database tables initialized');
    }

    // Register new user
    async registerUser(userData) {
        return new Promise((resolve, reject) => {
            const { address, username, email, provider = 'ChipiPay' } = userData;
            
            // Hash email for privacy
            const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
            
            const query = `
                INSERT INTO users (address, username, email, email_hash, provider)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [address, username, email, emailHash, provider], function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        if (err.message.includes('username')) {
                            reject(new Error('Username already taken'));
                        } else if (err.message.includes('email')) {
                            reject(new Error('Email already registered'));
                        } else if (err.message.includes('address')) {
                            reject(new Error('Address already registered'));
                        } else {
                            reject(new Error('User already exists'));
                        }
                    } else {
                        reject(err);
                    }
                } else {
                    resolve({
                        id: this.lastID,
                        address,
                        username,
                        email,
                        provider,
                        success: true
                    });
                }
            });
        });
    }

    // Get user by address
    async getUserByAddress(address) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, address, username, email, provider, created_at, 
                       gasless_quota, total_yield_earned, kyc_verified, is_active
                FROM users 
                WHERE address = ? AND is_active = 1
            `;
            
            this.db.get(query, [address], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get user by username
    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, address, username, email, provider, created_at,
                       gasless_quota, total_yield_earned, kyc_verified, is_active
                FROM users 
                WHERE username = ? AND is_active = 1
            `;
            
            this.db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Get address by username
    async getAddressByUsername(username) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT address 
                FROM users 
                WHERE username = ? AND is_active = 1
            `;
            
            this.db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.address : null);
                }
            });
        });
    }

    // Get username by address
    async getUsernameByAddress(address) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT username 
                FROM users 
                WHERE address = ? AND is_active = 1
            `;
            
            this.db.get(query, [address], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.username : null);
                }
            });
        });
    }

    // Update gasless quota
    async updateGaslessQuota(address, newQuota) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE users 
                SET gasless_quota = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE address = ?
            `;
            
            this.db.run(query, [newQuota, address], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // Log user activity
    async logActivity(userId, action, details = null, metadata = {}) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO activity_log (user_id, action, details, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [
                userId, 
                action, 
                details ? JSON.stringify(details) : null,
                metadata.ip || null,
                metadata.userAgent || null
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, success: true });
                }
            });
        });
    }

    // Record payment
    async recordPayment(paymentData) {
        return new Promise((resolve, reject) => {
            const { 
                fromUserId, 
                toUserId, 
                amount, 
                token = 'USDC', 
                message, 
                txHash, 
                invisible = true 
            } = paymentData;
            
            const query = `
                INSERT INTO payments (from_user_id, to_user_id, amount, token, message, tx_hash, invisible)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [fromUserId, toUserId, amount, token, message, txHash, invisible], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        success: true,
                        txHash,
                        amount,
                        token
                    });
                }
            });
        });
    }

    // Get user's payment history
    async getPaymentHistory(userId, limit = 50) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, 
                       from_user.username as from_username,
                       to_user.username as to_username
                FROM payments p
                JOIN users from_user ON p.from_user_id = from_user.id
                JOIN users to_user ON p.to_user_id = to_user.id
                WHERE p.from_user_id = ? OR p.to_user_id = ?
                ORDER BY p.created_at DESC
                LIMIT ?
            `;
            
            this.db.all(query, [userId, userId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Record yield position
    async recordYieldPosition(positionData) {
        return new Promise((resolve, reject) => {
            const { 
                userId, 
                strategyId, 
                strategyName, 
                amountBTC, 
                amountSats, 
                apy, 
                depositTxHash 
            } = positionData;
            
            const query = `
                INSERT INTO yield_positions (user_id, strategy_id, strategy_name, amount_btc, amount_sats, apy, deposit_tx_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(query, [userId, strategyId, strategyName, amountBTC, amountSats, apy, depositTxHash], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        success: true
                    });
                }
            });
        });
    }

    // Get user's yield positions
    async getYieldPositions(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM yield_positions 
                WHERE user_id = ? AND status = 'active'
                ORDER BY created_at DESC
            `;
            
            this.db.all(query, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get platform statistics
    async getPlatformStats() {
        return new Promise((resolve, reject) => {
            const queries = {
                totalUsers: 'SELECT COUNT(*) as count FROM users WHERE is_active = 1',
                totalPayments: 'SELECT COUNT(*) as count FROM payments',
                totalVolume: 'SELECT SUM(amount) as total FROM payments WHERE token = "USDC"',
                totalYieldPositions: 'SELECT COUNT(*) as count FROM yield_positions WHERE status = "active"',
                totalTVL: 'SELECT SUM(amount_btc) as total FROM yield_positions WHERE status = "active"'
            };
            
            const results = {};
            let completed = 0;
            const totalQueries = Object.keys(queries).length;
            
            Object.entries(queries).forEach(([key, query]) => {
                this.db.get(query, (err, row) => {
                    if (err) {
                        results[key] = 0;
                    } else {
                        results[key] = row.count || row.total || 0;
                    }
                    
                    completed++;
                    if (completed === totalQueries) {
                        resolve(results);
                    }
                });
            });
        });
    }

    // Close database connection
    close() {
        this.db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err);
            } else {
                console.log('✅ Database connection closed');
            }
        });
    }
}

module.exports = UserModel;